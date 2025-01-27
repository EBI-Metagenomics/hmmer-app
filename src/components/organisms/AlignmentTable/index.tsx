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

import { Alignment } from "@components/atoms";
import { Domain } from "@/client/types.gen";

import "./index.scss";

{
  /* <div class=" alimeta [% IF alignment.is_included == 0 %]insig[% END %]">
<table>
  <tr>
    <th colspan=2>Query </th>
    <th colspan=2>Target Envelope</th>
    <th colspan=2>Target Alignment</th>
    <th rowspan=2>Bias</th>
    <th rowspan=2>Accuracy</th>
    <th rowspan=2>% Identity (count)</th>
    <th rowspan=2>% Similarity (count)</th>
    <th rowspan=2>Bit Score</th>
    <th colspan=2>E-value</th>
  </tr>
  <tr>
      <th>start</th>
      <th>end</th>
      <th>start</th>
      <th>end</th>
      <th>start</th>
      <th>end</th>
      <th>Ind.</th>
      <th>Cond.</th>
  </tr>
  <tr class="header">
      <td>[% alignment.alihmmfrom | html %]</td>
      <td>[% alignment.alihmmto | html %]</td>
    <td>[% alignment.ienv | html %]</td>
    <td>[% alignment.jenv | html %]</td>
    <td>[% alignment.alisqfrom | html %]</td>
      <td>[% alignment.alisqto | html %]</td>
      <td>[% alignment.bias | html %]</td>
    <td>[% alignment.oasc | html %]</td>
    <td>[% (alignment.aliId * 100) | format("%.1f") %] ([% alignment.aliIdCount | html %])</td>
    <td>[% (alignment.aliSim * 100) | format("%.1f") %] ([% alignment.aliSimCount | html %])</td>
    <td>[% alignment.bitscore | format("%.1f") %]</td>
    <td>[% alignment.ievalue | html %]</td>
    <td>[% alignment.cevalue | html %]</td> */
}

const columnHelper = createColumnHelper<Domain>();

const columns = [
  columnHelper.group({
    header: "Query",
    columns: [
      columnHelper.accessor("alignment.hmm_from", {
        header: "start",
      }),
      columnHelper.accessor("alignment.hmm_to", {
        header: "end",
      }),
    ],
  }),
  columnHelper.group({
    header: "Target Envelope",
    columns: [
      columnHelper.accessor("env_from", {
        header: "start",
      }),
      columnHelper.accessor("env_to", {
        header: "end",
      }),
    ],
  }),
  columnHelper.group({
    header: "Target Alignment",
    columns: [
      columnHelper.accessor("alignment.target_from", {
        header: "start",
      }),
      columnHelper.accessor("alignment.target_to", {
        header: "end",
      }),
    ],
  }),
  columnHelper.accessor("bias", {
    header: "Bias",
    cell: (props) => props.getValue().toPrecision(2),
  }),
  {
    id: "identity",
    header: "% Identity (count)",
    cell: ({ row }: { row: Row<Domain> }) => (
      <div>
        {/* TODO: Remove ts-ignore once https://github.com/vitalik/django-ninja/pull/1162 is resolved */}
        {/* @ts-ignore */}
        {(100.0 * row.original.alignment.identity_score).toFixed(1)} ({row.original.alignment.identity_count})
      </div>
    ),
  },
  {
    id: "similarity",
    header: "% Similarity (count)",
    cell: ({ row }: { row: Row<Domain> }) => (
      <div>
        {/* TODO: Remove ts-ignore once https://github.com/vitalik/django-ninja/pull/1162 is resolved */}
        {/* @ts-ignore */}
        {(100.0 * row.original.alignment.similarity_score).toFixed(1)} ({row.original.alignment.similarity_count})
      </div>
    ),
  },
  columnHelper.accessor("score", {
    header: "Bit Score",
    cell: (props) => props.getValue().toFixed(1),
  }),
  columnHelper.group({
    header: "E-value",
    columns: [
      columnHelper.accessor("i_evalue", {
        header: "Independent",
        cell: (props) => props.getValue().toPrecision(2),
      }),
      columnHelper.accessor("c_evalue", {
        header: "Conditional",
        cell: (props) => props.getValue().toPrecision(2),
      }),
    ],
  }),
];

interface AlignmentTableProps {
  domain: Domain;
}

export const AlignmentTable: React.FC<AlignmentTableProps> = ({ domain }) => {
  const table = useReactTable({
    data: useMemo(() => [domain], [domain]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <table className="vf-table vf-table--bordered vf-table--compact alignment-table vf-u-width__100">
      <thead className="vf-table__header">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="vf-table__row">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="vf-table__heading" colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="vf-table__cell" colSpan={999}>
                  <Alignment alignment={domain.alignment} algorithm="phmmer" />
                </td>
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};
