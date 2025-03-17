import { useState, useMemo, useEffect } from "react";
import _ from "lodash";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    ColumnFiltersState,
    Row,
    Table,
    RowData,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { taxonomyApiGetTaxonomyDistributionOptions } from "@/client/@tanstack/react-query.gen";
import { TaxonomyResult } from "@/client/types.gen";

import "./index.scss";

declare module '@tanstack/table-core' {
    interface TableMeta<TData extends RowData> {
      resultId: string
    }
  }

const columnHelper = createColumnHelper<TaxonomyResult>();

const columns = [
    columnHelper.accessor("taxonomy_id", {
        id: "taxonomyId",
        header: "Taxonomy ID",
        filterFn: (row, columnId, filterValue) => _.includes(filterValue, row.getValue(columnId)),
    }),
    columnHelper.accessor("species", {
        header: "Species",
    }),
    columnHelper.accessor("count", {
        header: "Count",
    }),
    {
        id: "show",
        header: "View",
        cell: ({ row, table }: { row: Row<TaxonomyResult>, table: Table<TaxonomyResult> }) => {
            return <Link to={{pathname: `/results/${table.options.meta?.resultId}/score`, search: `?taxonomyIds=${row.original.taxonomy_id}`}} className="vf-link">Show</Link>;
        },
    },
];

interface ResultTableProps {
    id: string;
    visibleIds: number[];
}

export const TaxonomyTable: React.FC<ResultTableProps> = ({ id, visibleIds }) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data } = useQuery({
        ...taxonomyApiGetTaxonomyDistributionOptions({
            path: { id: id! },
        }),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        setColumnFilters([
            {
                id: "taxonomyId",
                value: visibleIds,
            },
        ]);
    }, [visibleIds]);

    const defaultData = useMemo(() => [], []);

    const table = useReactTable({
        data: data?.distribution ?? defaultData,
        columns,
        initialState: {
            columnVisibility: {
                taxonomyId: false,
            },
        },
        state: {
            columnFilters,
        },
        meta: {
            resultId: id,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="table-container">
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
        </div>
    );
};
