import { Fragment, useMemo } from "react";
import _ from "lodash";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table";

import { Alignment, ProgressIndicator } from "@components/atoms";
import { P7Domain } from "@/client/types.gen";
import { useDomains } from "@/hooks/useDomains";

import "./index.scss";

interface AlignmentViewProps {
    id: string;
    index: number;
}

export const AlignmentView: React.FC<AlignmentViewProps> = ({ id, index }) => {
    const { data, status } = useDomains(id, index);

    if (status === "pending" || data?.status !== "SUCCESS")
        return (
            <div
                className="vf-u-margin__top--200 vf-u-margin__bottom--600"
                style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}
            >
                <ProgressIndicator width={"95%"} />
            </div>
        );

    return (
        <div className="vf-stack vf-stack--200">
            {_.map(data?.domains ?? [], (domain) => (
                <AlignmentTable domain={domain} />
            ))}
        </div>
    );
};

const columnHelper = createColumnHelper<P7Domain>();

const columns = [
    columnHelper.group({
        header: "Query",
        columns: [
            columnHelper.accessor("alignment_display.hmmfrom", {
                header: "start",
            }),
            columnHelper.accessor("alignment_display.hmmto", {
                header: "end",
            }),
        ],
    }),
    columnHelper.group({
        header: "Target Envelope",
        columns: [
            columnHelper.accessor("ienv", {
                header: "start",
            }),
            columnHelper.accessor("jenv", {
                header: "end",
            }),
        ],
    }),
    columnHelper.group({
        header: "Target Alignment",
        columns: [
            columnHelper.accessor("alignment_display.sqfrom", {
                header: "start",
            }),
            columnHelper.accessor("alignment_display.sqto", {
                header: "end",
            }),
        ],
    }),
    columnHelper.accessor("dombias", {
        header: "Bias",
        cell: (props) => props.getValue().toPrecision(2),
    }),
    {
        id: "identity",
        header: "% Identity (count)",
        cell: ({ row }: { row: Row<P7Domain> }) => (
            <div>
                {/* TODO: Remove ts-ignore once https://github.com/vitalik/django-ninja/pull/1162 is resolved */}
                {/* @ts-ignore */}
                {(100.0 * row.original.alignment_display.identity?.[0]).toFixed(
                    1,
                )} ({row.original.alignment_display.identity?.[1]})
            </div>
        ),
    },
    {
        id: "similarity",
        header: "% Similarity (count)",
        cell: ({ row }: { row: Row<P7Domain> }) => (
            <div>
                {/* TODO: Remove ts-ignore once https://github.com/vitalik/django-ninja/pull/1162 is resolved */}
                {/* @ts-ignore */}
                {(100.0 * row.original.alignment_display.similarity?.[0]).toFixed(
                    1,
                )} ({row.original.alignment_display.similarity?.[1]})
            </div>
        ),
    },
    columnHelper.accessor("bitscore", {
        header: "Bit Score",
        cell: (props) => props.getValue().toFixed(1),
    }),
    columnHelper.group({
        header: "E-value",
        columns: [
            columnHelper.accessor("ievalue", {
                header: "Independent",
                cell: (props) => props.getValue().toPrecision(2),
            }),
            columnHelper.accessor("cevalue", {
                header: "Conditional",
                cell: (props) => props.getValue().toPrecision(2),
            }),
        ],
    }),
];

interface AlignmentTableProps {
    domain: P7Domain;
}

export const AlignmentTable: React.FC<AlignmentTableProps> = ({ domain }) => {
    const table = useReactTable({
        data: useMemo(() => [domain], [domain]),
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <table className="vf-table vf-table--bordered alignment-table">
            <thead className="vf-table__header">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="vf-table__row">
                        {headerGroup.headers.map((header) => (
                            <th key={header.id} className="vf-table__heading" colSpan={header.colSpan}>
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
                        <Fragment key={row.id}>
                            <tr className="vf-table__row">
                                {/* first row is a normal row */}
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <td key={cell.id} className="vf-table__cell">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td className="vf-table__cell" colSpan={999}>
                                    <Alignment alignment={row.original.alignment_display} algorithm="phmmer" />
                                </td>
                            </tr>
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};
