import { useMemo } from "react";
import _ from "lodash";

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    Row,
    Table,
    RowData,
} from "@tanstack/react-table";
import { Link } from "react-router";

import "./index.scss";

interface TaxonomyResult {
    taxonomy_id: number;
    species: string;
    count: number;
}

declare module "@tanstack/table-core" {
    interface TableMeta<TData extends RowData> {
        resultId?: string;
    }
}

const columnHelper = createColumnHelper<TaxonomyResult>();

const columns = [
    columnHelper.accessor("species", {
        header: "Species",
    }),
    columnHelper.accessor("count", {
        header: "Count",
    }),
    {
        id: "show",
        header: "View",
        cell: ({ row, table }: { row: Row<TaxonomyResult>; table: Table<TaxonomyResult> }) => {
            return (
                <Link
                    to={{
                        pathname: `/results/${table.options.meta?.resultId}/score`,
                        search: `?taxonomyIds=${row.original.taxonomy_id}`,
                    }}
                    className="vf-link"
                >
                    Show
                </Link>
            );
        },
    },
];

interface ResultTableProps {
    id: string;
    rows: TaxonomyResult[];
}

export const TaxonomyTable: React.FC<ResultTableProps> = ({ id, rows }) => {
    const defaultData = useMemo(() => [], []);

    const table = useReactTable({
        data: rows ?? defaultData,
        columns,
        meta: {
            resultId: id,
        },
        getCoreRowModel: getCoreRowModel(),
    });

    return (
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
                        <tr key={row.id} className="vf-table__row">
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
    );
};
