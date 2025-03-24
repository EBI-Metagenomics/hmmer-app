import { Fragment, useState, useMemo, useEffect } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    Row,
    VisibilityState,
    Table,
} from "@tanstack/react-table";

import { TreeToggleButton, HitPosition, Alignment } from "@components/atoms";
import { Pagination, JobStatus } from "@components/molecules";
import {
    Annotations,
    AlignmentView,
    SpeciesFilter,
    ArchitectureFilter,
    DistributionGraph,
} from "@components/organisms";
import { P7Hit, ResultResponseSchema } from "@/client/types.gen";

import { useColumns } from "@/context/columns";

import "./index.scss";

const columnHelper = createColumnHelper<P7Hit>();

const columns = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return <TreeToggleButton onClick={row.getToggleExpandedHandler()} isOpen={row.getIsExpanded()} />;
        },
        enableHiding: false,
        maxSize: 10,
    },
    {
        id: "rowNumber",
        header: "Row",
        cell: ({ row }: { row: Row<P7Hit> }) => row.index + 1,
        maxSize: 20,
    },
    columnHelper.accessor("metadata.accession", {
        id: "accession",
        header: "Target",
        enableHiding: false,
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return (
                <a href={(row.original.metadata?.external_link as string) ?? ""} className="vf-link">
                    {(row.original.metadata?.accession as string) ?? ""}
                </a>
            );
        },
    }),
    columnHelper.accessor("metadata.identifier", {
        id: "identifier",
        header: "Secondary Accessions & Ids",
    }),
    columnHelper.accessor("metadata.description", {
        id: "description",
        header: "Description",
        minSize: 800,
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
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return (
                <a href={(row.original.metadata?.taxonomy_link as string) ?? ""} className="vf-link">
                    {(row.original.metadata?.species as string) ?? ""}
                </a>
            );
        },
        minSize: 300,
    }),
    {
        id: "structures",
        header: "Predicted Structures",
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return (
                <ul className="vf-list vf-list--default | vf-list--tight">
                    {_.map(row.original.metadata?.structures ?? [], ({ id, external_link }) => (
                        <li key={id} className="vf-list__item">
                            <a href={external_link} className="vf-link">
                                {id}
                            </a>
                        </li>
                    ))}
                </ul>
            );
        },
    },
    {
        id: "hitPositions",
        header: "Hit Positions",
        cell: ({ row }: { row: Row<P7Hit> }) => <HitPosition hit={row.original} />,
    },
    {
        id: "numHits",
        header: "# Hits",
        cell: ({ row }: { row: Row<P7Hit> }) => row.original.nreported,
    },
    {
        id: "numSignificantHits",
        header: "# Significant Hits",
        cell: ({ row }: { row: Row<P7Hit> }) => row.original.nincluded,
    },
    columnHelper.accessor("score", {
        id: "bitscore",
        header: "Bit Score",
        cell: (props) => props.getValue().toFixed(2),
    }),
    columnHelper.accessor("evalue", {
        id: "evalue",
        header: "E-value",
        cell: (props) => props.getValue()?.toPrecision(2),
        enableHiding: false,
        minSize: 150,
    }),
];

const hmmscanColumns = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return <TreeToggleButton onClick={row.getToggleExpandedHandler()} isOpen={row.getIsExpanded()} />;
        },
        enableHiding: false,
        maxSize: 10,
    },
    columnHelper.group({
        header: "Family",
        columns: [
            columnHelper.accessor("metadata.identifier", {
                id: "identifier",
                header: "Identifier",
            }),
            columnHelper.accessor("metadata.accession", {
                id: "accession",
                header: "Accession",
                enableHiding: false,
                cell: ({ row }: { row: Row<P7Hit> }) => {
                    return (
                        <a href={(row.original.metadata?.external_link as string) ?? ""} className="vf-link">
                            {(row.original.metadata?.accession as string) ?? ""}
                        </a>
                    );
                },
            }),
        ],
    }),
    columnHelper.accessor("metadata.clan", {
        id: "clan",
        header: "Clan",
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return (
                <a href={(row.original.metadata?.clan_link as string) ?? ""} className="vf-link">
                    {(row.original.metadata?.clan as string) ?? ""}
                </a>
            );
        },
    }),
    columnHelper.accessor("metadata.description", {
        id: "description",
        header: "Description",
        minSize: 800,
    }),
    {
        id: "start",
        header: "Start",
        cell: ({ row }: { row: Row<P7Hit> }) => row.original.domains?.[row.original.best_domain].ienv,
    },
    {
        id: "end",
        header: "End",
        cell: ({ row }: { row: Row<P7Hit> }) => row.original.domains?.[row.original.best_domain].jenv,
    },
    columnHelper.group({
        header: "Alignment",
        columns: [
            {
                id: "alignmentStart",
                header: "Start",
                cell: ({ row }: { row: Row<P7Hit> }) => row.original.domains?.[row.original.best_domain].iali,
            },
            {
                id: "alignmentEnd",
                header: "End",
                cell: ({ row }: { row: Row<P7Hit> }) => row.original.domains?.[row.original.best_domain].jali,
            },
        ],
    }),
    columnHelper.group({
        header: "Model",
        columns: [
            {
                id: "modelStart",
                header: "Start",
                cell: ({ row }: { row: Row<P7Hit> }) =>
                    row.original.domains?.[row.original.best_domain].alignment_display.hmmfrom,
            },
            {
                id: "modelEnd",
                header: "End",
                cell: ({ row }: { row: Row<P7Hit> }) =>
                    row.original.domains?.[row.original.best_domain].alignment_display.hmmto,
            },
            {
                id: "modelLength",
                header: "Length",
                cell: ({ row }: { row: Row<P7Hit> }) =>
                    row.original.domains?.[row.original.best_domain].alignment_display.m,
            },
        ],
    }),
    columnHelper.accessor("score", {
        id: "bitscore",
        header: "Bit Score",
        cell: (props) => props.getValue().toFixed(2),
    }),
    columnHelper.group({
        header: "Domain e-values",
        columns: [
            {
                id: "domainIEvalue",
                header: "Independent",
                cell: ({ row }: { row: Row<P7Hit> }) =>
                    row.original.domains?.[row.original.best_domain].ievalue?.toPrecision(2),
            },
            {
                id: "domainCEvalue",
                header: "Conditional",
                cell: ({ row }: { row: Row<P7Hit> }) =>
                    row.original.domains?.[row.original.best_domain].cevalue?.toPrecision(2),
            },
        ],
    }),
];

interface ResultTableProps {
    id: string;
    data?: ResultResponseSchema;
}

export const ResultTable: React.FC<ResultTableProps> = ({ id, data }) => {
    const [searchParams, setSearchParams] = useSearchParams({
        page: _.toString(1),
        pageSize: _.toString(50),
    });

    const page = _.toInteger(searchParams.get("page"));
    const pageSize = _.toInteger(searchParams.get("pageSize"));
    const taxonomyIds = searchParams.getAll("taxonomyIds").map(_.toInteger);
    const architecture = searchParams.get("architectures") || undefined;
    const [columnVisibility, setColumnVisibility] = useColumns();

    const algo = data?.result?.stats.algo ?? "unknown";

    const defaultData = useMemo(() => [], []);

    const table = useReactTable({
        data: data?.result?.hits ?? defaultData,
        columns: algo === "hmmscan" ? hmmscanColumns : columns,
        getRowCanExpand: (row) => row.original.nincluded > 0,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => (row.metadata?.accession as string) ?? "-1",
        rowCount: data?.result?.stats?.nreported ?? 0,
        manualPagination: true,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnVisibility,
        },
        defaultColumn: {
            minSize: 100,
        },
    });

    useEffect(() => {
        localStorage.setItem("columnVisibility", JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    if (data?.status === "SUCCESS")
        return (
            <div className="embl-grid">
                <div className="vf-stack vf-stack__400">
                    {algo !== "hmmscan" && <SpeciesFilter />}
                    {algo !== "hmmscan" && <ArchitectureFilter />}
                    <ColumnSelection table={table} />
                </div>
                <div className="vf-stack vf-stack--800">
                    {taxonomyIds.length === 0 && !architecture && algo !== "hmmscan" && <DistributionGraph id={id} />}
                    {algo !== "hmmsearch" && <Annotations id={id} />}
                    <div className="vf-stack vf-stack--200">
                        <div className="table-container">
                            <table className="vf-table" style={{ height: "100%" }}>
                                <thead className="vf-table__header">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="vf-table__row">
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    colSpan={header.colSpan}
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
                                            <Fragment key={row.original.index}>
                                                <tr className="vf-table__row">
                                                    {/* first row is a normal row */}
                                                    {row.getVisibleCells().map((cell) => {
                                                        return (
                                                            <td
                                                                key={cell.id}
                                                                className="vf-table__cell"
                                                                width={cell.column.getSize()}
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
                                                        <td
                                                            colSpan={row.getVisibleCells().length}
                                                            className="alignment-cell"
                                                        >
                                                            {algo === "hmmscan" && (
                                                                <table className="vf-table vf-table--bordered alignment-table vf-u-width__100">
                                                                    <tbody className="vf-table__body">
                                                                        <tr className="vf-table__row">
                                                                            <td
                                                                                className="vf-table__cell"
                                                                                colSpan={999}
                                                                            >
                                                                                <Alignment
                                                                                    alignment={
                                                                                        row.original.domains?.[
                                                                                            row.original.best_domain
                                                                                        ].alignment_display!
                                                                                    }
                                                                                    algorithm="hmmscan"
                                                                                />
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            )}
                                                            {algo !== "hmmscan" && (
                                                                <div className="vf-stack vf-stack--200">
                                                                    <AlignmentView
                                                                        id={id}
                                                                        index={row.original.index!}
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={page}
                            currentPageSize={pageSize}
                            pageCount={data?.page_count ?? 1}
                            pageSizeOptions={[50, 100, 250, 1000]}
                            onPageChange={(page) =>
                                setSearchParams((prevSearchParams) => {
                                    prevSearchParams.set("page", _.toString(page));
                                    return prevSearchParams;
                                })
                            }
                            onPageSizeChange={(pageSize) =>
                                setSearchParams((prevSearchParams) => {
                                    prevSearchParams.set("pageSize", _.toString(pageSize));
                                    return prevSearchParams;
                                })
                            }
                        />
                    </div>
                </div>
            </div>
        );

    if (data?.status === "FAILURE") return <div>Your job failed</div>;

    return <JobStatus status={data?.status ?? "PENDING"} id={id!} />;
};

interface ColumnSelectionProps {
    table: Table<P7Hit>;
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({ table }) => {
    return (
        <fieldset className="vf-form__fieldset vf-stack vf-stack--200 vf-text-body vf-text-body--3">
            <legend className="vf-form__legend">Columns</legend>
            {_(table.getAllLeafColumns())
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                        <div key={column.id} className="vf-form__item vf-form__item--checkbox">
                            <input
                                {...{
                                    type: "checkbox",
                                    id: `${column.id}`,
                                    checked: column.getIsVisible(),
                                    onChange: column.getToggleVisibilityHandler(),
                                    className: "vf-form__checkbox",
                                }}
                            />
                            <label htmlFor={`${column.id}`} className="vf-form__label">
                                {column.parent && `${column.parent.columnDef.header?.toString()} - `}
                                {column.columnDef?.header?.toString() || column.id}
                            </label>
                        </div>
                    );
                })
                .value()}
        </fieldset>
    );
};
