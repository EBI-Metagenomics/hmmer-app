import { NavLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, Row } from "@tanstack/react-table";
import { JobsResponseSchema } from "@/client/types.gen";
import { searchApiGetJobsOptions } from "@/client/@tanstack/react-query.gen";

const columnHelper = createColumnHelper<JobsResponseSchema>();

const columns = [
    columnHelper.accessor("task.status", {
        header: "Status",
        cell: ({ row }: { row: Row<JobsResponseSchema> }) => (
            <span
                style={{
                    color:
                        row.original.task.status === "SUCCESS"
                            ? "#18974c"
                            : row.original.task.status === "FAILURE"
                              ? "#d32f2f"
                              : "",
                }}
            >
                {row.original.task.status}
            </span>
        ),
    }),
    columnHelper.accessor("id", {
        header: "ID",
        cell: ({ row }: { row: Row<JobsResponseSchema> }) => (
            <NavLink to={`/results/${row.original.id}/score`}>{row.original.id}</NavLink>
        ),
    }),
    columnHelper.accessor("algo", {
        header: "Algorithm",
    }),
    columnHelper.accessor("task.date_created", {
        header: "Started",
        cell: ({ row }: { row: Row<JobsResponseSchema> }) => (
            <span>{new Date(row.original.task.date_created).toLocaleString()}</span>
        ),
    }),
    columnHelper.accessor("task.date_done", {
        header: "Finished",
        cell: ({ row }: { row: Row<JobsResponseSchema> }) => (
            <span>{new Date(row.original.task.date_done).toLocaleString()}</span>
        ),
    }),
];

const ResultsPage: React.FC = () => {
    const { data } = useQuery({
        ...searchApiGetJobsOptions(),
    });

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-u-padding__top--800">
                <h2 className="vf-text vf-text-heading--2">Results</h2>
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

export default ResultsPage;
