import { NavLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, Row } from "@tanstack/react-table";
import { JackhmmerResponseSchema } from "@/client/types.gen";
import { resultApiGetResultOptions } from "@/client/@tanstack/react-query.gen";

import { ProgressIndicator } from "@/components/atoms";

const columnHelper = createColumnHelper<JackhmmerResponseSchema>();

const columns = [
    columnHelper.accessor("iteration", {
        header: "Iteration",
        cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) => row.original.iteration,
    }),
    columnHelper.accessor("id", {
        header: "Results",
        cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
            row.original.status === "SUCCESS" ? (
                <NavLink to={`/results/${row.original.id}/score`}>{row.original.id}</NavLink>
            ) : (
                <span>{row.original.id}</span>
            ),
    }),
    columnHelper.group({
        header: "Hits",
        columns: [
            columnHelper.accessor("convergence_stats.gained", {
                header: "New",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.gained > 0 ? (
                        <span style={{ color: "#18974c" }}>+{row.original.convergence_stats.gained}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.lost", {
                header: "Lost",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.lost > 0 ? (
                        <span style={{ color: "#a6093d" }}>-{row.original.convergence_stats.lost}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.dropped", {
                header: "Dropped",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.dropped > 0 ? (
                        <span style={{ color: "#d32f2f" }}>{row.original.convergence_stats.dropped}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.total", {
                header: "Total",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats ? (
                        <span>{row.original.convergence_stats.total}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
        ],
    }),
];

interface JackhmmerTableProps {
    id: string;
}

export const JackhmmerTable: React.FC<JackhmmerTableProps> = ({ id }) => {
    const { data, isPending } = useQuery({
        ...resultApiGetResultOptions({ path: { id } }),
        refetchInterval(query) {
            if (
                _.every((query.state.data ?? []) as JackhmmerResponseSchema[], (jackhmmerIteration) => {
                    return jackhmmerIteration.status === "SUCCESS";
                })
            ) {
                return 5000;
            }

            return 1000;
        },
        refetchIntervalInBackground: true,
    });

    const table = useReactTable({
        data: (data ?? []) as JackhmmerResponseSchema[],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching your Jackhmmer results...</p>
                <ProgressIndicator />
            </div>
        );

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-u-padding__top--400">
                <h2 className="vf-text vf-text-heading--2">Jackhmmer Summary</h2>
            </div>
            <div>
                <table className="vf-table vf-u-width__100">
                    <thead className="vf-table__header">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="vf-table__row">
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="vf-table__heading">
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
