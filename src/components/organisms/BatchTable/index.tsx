import _ from "lodash";
import { NavLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, Row } from "@tanstack/react-table";
import { BatchResponseSchema } from "@/client/types.gen";
import { resultApiGetResultOptions, searchApiGetJobDetailsOptions } from "@/client/@tanstack/react-query.gen";

import { JobStatus, ProgressIndicator } from "@/components/atoms";
import { pending } from "@/utils/taskStates";

const columnHelper = createColumnHelper<BatchResponseSchema>();

const columns = [
    columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }: { row: Row<BatchResponseSchema> }) => <JobStatus status={row.original.status} />,
    }),
    columnHelper.accessor("query_name", {
        header: "Query name",
        cell: ({ row }: { row: Row<BatchResponseSchema> }) => <span>{row.original.query_name}</span>,
    }),
    columnHelper.accessor("id", {
        header: "Results",
        cell: ({ row }: { row: Row<BatchResponseSchema> }) =>
            pending(row.original) ? (
                <ProgressIndicator width={380} />
            ) : row.original.status === "SUCCESS" ? (
                <NavLink to={`/results/${row.original.id}/score`}>{row.original.id}</NavLink>
            ) : (
                <span>{row.original.id}</span>
            ),
    }),
];

interface BatchTableProps {
    id: string;
}

export const BatchTable: React.FC<BatchTableProps> = ({ id }) => {
    const { data, isPending } = useQuery({
        ...resultApiGetResultOptions({ path: { id } }),
        refetchInterval(query) {
            if (
                _.every((query.state.data ?? []) as BatchResponseSchema[], (job) => {
                    return job.status === "SUCCESS";
                })
            ) {
                return 5000;
            }

            return 1000;
        },
        refetchIntervalInBackground: true,
    });

    const { data: jobDetailsData } = useQuery({
        ...searchApiGetJobDetailsOptions({ path: { id: id! } }),
        refetchIntervalInBackground: true,
    });

    const table = useReactTable({
        data: (data ?? []) as BatchResponseSchema[],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isPending)
        return (
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <h2 className="vf-text vf-text-heading--2">Batch {_.capitalize(jobDetailsData?.algo ?? "")} job summary</h2>
                </div>

                <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                    <p className="vf-text-body vf-text-body--2">Fetching your batch job results...</p>
                    <ProgressIndicator />
                </div>
            </div>
        );

    if (((data ?? []) as BatchResponseSchema[]).length === 0) {
        return (
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <h2 className="vf-text vf-text-heading--2">Batch {_.capitalize(jobDetailsData?.algo ?? "")} job summary</h2>
                </div>

                <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                    <p className="vf-text-body vf-text-body--2">Jobs are not scheduled yet...</p>
                    <ProgressIndicator />
                </div>
            </div>
        );
    }

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-u-padding__top--400">
                <h2 className="vf-text vf-text-heading--2">Batch {_.capitalize(jobDetailsData?.algo ?? "")} job summary</h2>
            </div>
            <div>
                <table className="vf-table vf-u-width__100">
                    <thead className="vf-table__header">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="vf-table__row">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} colSpan={header.colSpan} className="vf-table__heading">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="vf-table__body">
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <tr key={row.original.id} className="vf-table__row">
                                    {/* first row is a normal row */}
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <td key={cell.id} className="vf-table__cell">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
