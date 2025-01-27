import { Fragment, useState, useMemo } from "react";
import _ from "lodash";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  PaginationState,
  Row,
  VisibilityState,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Modal from "react-modal";

import { resultApiGetResultOptions } from "@/client/@tanstack/react-query.gen";
import { TreeToggleButton } from "@components/atoms";
import { Pagination } from "@components/molecules";
import { AlignmentTable } from "@components/organisms";
import { Hit } from "@/client/types.gen";

import "./index.scss";

Modal.setAppElement("#root");

const columnHelper = createColumnHelper<Hit>();

const defaultColumns = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }: { row: Row<Hit> }) => {
      return (
        <TreeToggleButton
          onClick={row.getToggleExpandedHandler()}
          isOpen={row.getIsExpanded()}
        />
      );
    },
    enableHiding: false,
  },
  {
    id: "rowNumber",
    header: "Row",
    cell: ({ row }: { row: Row<Hit> }) => row.index + 1,
  },
  columnHelper.accessor("metadata.accession", {
    id: "accession",
    header: "Target",
    enableHiding: false,
    cell: ({ row }: { row: Row<Hit> }) => {
      return <a href={row.original.metadata.external_link} className="vf-link">{row.original.metadata.accession}</a>;
    },
  }),
  columnHelper.accessor("metadata.identifier", {
    id: "identifier",
    header: "Secondary Accessions & Ids",
  }),
  columnHelper.accessor("metadata.description", {
    id: "description",
    header: "Description",
  }),
  columnHelper.accessor("metadata.kingdom", {
    id: "kingdom",
    header: "Kingdom",
  }),
  columnHelper.accessor("metadata.phylum", {
    id: "phylum",
    header: "Phylum",
  }),
  columnHelper.accessor("metadata.species", {
    id: "species",
    header: "Species",
    cell: ({ row }: { row: Row<Hit> }) => {
      return <a href={row.original.metadata.taxonomy_link} className="vf-link">{row.original.metadata.species}</a>;
    },
  }),
  {
    id: "structures",
    header: "Predicted Structures",
    cell: ({ row }: { row: Row<Hit> }) => {
      return (
        <ul className="vf-list vf-list--default | vf-list--tight">
          {_.map(row.original.metadata.structures ?? [], ({id, external_link}) => (
            <li key={id} className="vf-list__item">
              <a href={external_link} className="vf-link">{id}</a>
            </li>
          ))}
        </ul>
      );
    },
  },
  {
    id: "numHits",
    header: "# Hits",
    cell: ({ row }: { row: Row<Hit> }) => row.original.domains.reported.length,
  },
  {
    id: "numSignificantHits",
    header: "# Significant Hits",
    cell: ({ row }: { row: Row<Hit> }) => row.original.domains.included.length,
  },
  columnHelper.accessor("score", {
    id: "bitscore",
    header: "Bit Score",
    cell: (props) => props.getValue().toFixed(2),
  }),
  columnHelper.accessor("evalue", {
    id: "evalue",
    header: "E-value",
    cell: (props) => props.getValue().toPrecision(2),
    enableHiding: false,
  }),
];

interface ResultTableProps {
  id: string;
}

export const ResultTable = ({ id }: ResultTableProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    rowNumber: false,
    identifier: false,
    kingdom: false,
    phylum: false,
    structures: false,
    numHits: false,
    numSignificantHits: false,
    bitscore: false,
  });

  const [columns] = useState<typeof defaultColumns>(() => [...defaultColumns]);

  const [columnsOpen, setColumnsOpen] = useState(false);

  const { data } = useQuery({
    ...resultApiGetResultOptions({
      path: { id: id! },
      query: {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      },
    }),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  const defaultData = useMemo(() => [], []);

  const table = useReactTable({
    data: data?.hits ?? defaultData,
    columns,
    getRowCanExpand: (row) => row.original.domains.included.length > 0,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.metadata.accession,
    rowCount: data?.stats.reported_hits,
    manualPagination: true,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      columnVisibility,
    },
  });

  return (
    <div className="vf-stack">
      <div>
        <div className="button-container">
          <button
            className="vf-button vf-button--primary vf-button--sm"
            onClick={() => setColumnsOpen(true)}
          >
            Columns
          </button>
        </div>
        <Modal
          isOpen={columnsOpen}
          onRequestClose={() => setColumnsOpen(false)}
          contentLabel="Columns"
          style={{
            overlay: {
              zIndex: 2000,
              position: "fixed",
            },
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
            },
          }}
        >
          <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
            <legend className="vf-form__legend">Columns</legend>
            <div className="vf-form__item vf-form__item--checkbox">
              <input
                {...{
                  type: "checkbox",
                  id: "checkAll",
                  checked: table.getIsAllColumnsVisible(),
                  onChange: table.getToggleAllColumnsVisibilityHandler(),
                  className: "vf-form__checkbox",
                }}
              />
              <label htmlFor="checkAll" className="vf-form__label">
                Toggle All
              </label>
            </div>
            {_(table.getAllLeafColumns())
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <div
                    key={column.id}
                    className="vf-form__item vf-form__item--checkbox"
                  >
                    <input
                      {...{
                        type: "checkbox",
                        id: `check${column.id}`,
                        checked: column.getIsVisible(),
                        onChange: column.getToggleVisibilityHandler(),
                        className: "vf-form__checkbox",
                      }}
                    />
                    <label
                      htmlFor={`check${column.id}`}
                      className="vf-form__label"
                    >
                      {column.columnDef?.header?.toString() || column.id}
                    </label>
                  </div>
                );
              })
              .value()}
          </fieldset>
        </Modal>
      </div>
      <div className="vf-stack vf-stack--200">
        <div className="table-container">
          <table className="vf-table vf-u-width__100">
            <thead className="vf-table__header">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="vf-table__row">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="vf-table__heading"
                    >
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
                  <Fragment >
                    <tr key={row.id} className="vf-table__row">
                      {/* first row is a normal row */}
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td
                            key={cell.id}
                            className="vf-table__cell"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    {row.getIsExpanded() && (
                      <tr>
                        {/* 2nd row is a custom 1 cell row */}
                        <td colSpan={row.getVisibleCells().length}>
                          <div className="vf-stack vf-stack--200">
                            {_.map(
                              row.original.domains.included,
                              (domain, index) => (
                                <AlignmentTable
                                  key={`${row.original.metadata.accession}-${index}`}
                                  domain={domain}
                                />
                              ),
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot className="vf-table__footer table-footer">
              <tr>
                <td colSpan={1000}>
                  <Pagination
                    tableInstance={table}
                    pageSizeOptions={[50, 100, 250, 1000]}
                  />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
