import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router";
import ReactModal from "react-modal";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    Row,
    Table,
} from "@tanstack/react-table";

import { TreeToggleButton, HitPosition, Alignment, ProgressIndicator, NotFound } from "@components/atoms";
import { Pagination } from "@components/molecules";
import { Annotations, AlignmentView, ResultFilter, DistributionGraph, SearchDetails } from "@components/organisms";
import { P7Hit } from "@/client/types.gen";
import { useResult } from "@/hooks/useResult";
import { useColumns, usePageSize, useStats, defaultColumns, defaultPageSize } from "@/context";
import { pending, failed } from "@/utils/taskStates";
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
        header: "Row number",
        cell: ({ row }: { row: Row<P7Hit> }) => (row.original.index ?? 0) + 1,
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
}

export const ResultTable: React.FC<ResultTableProps> = ({ id }) => {
    const [customsationOpen, setCustomsationOpen] = useState<boolean>(false);
    const [storePageSize, setStoredPageSize] = usePageSize();
    const [storedColumns, setStoredColumns] = useColumns();
    const [stats, setStats] = useStats();

    const [searchParams, setSearchParams] = useSearchParams({
        page: _.toString(1),
        pageSize: _.toString(storePageSize),
    });

    const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);
    const page = _.toInteger(searchParams.get("page"));
    const pageSize = _.toInteger(searchParams.get("pageSize"));
    const row = _.toInteger(searchParams.get("row"));
    const taxonomyIds = searchParams.getAll("taxonomyIds").map(_.toInteger);
    const architecture = searchParams.get("architectures") || undefined;

    const { data, isPending } = useResult(id!, page, pageSize, storedColumns.hitPositions, taxonomyIds, architecture);

    const algo = data?.result?.stats.algo ?? "unknown";

    const defaultData = useMemo(() => [], []);

    const table = useReactTable({
        data: data?.result?.hits ?? defaultData,
        columns:
            algo === "hmmscan"
                ? hmmscanColumns
                : stats?.database === "pdb"
                  ? _.reject(columns, ["id", "structures"])
                  : columns,
        getRowCanExpand: (row) => row.original.nincluded > 0,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row) => (row.metadata?.accession as string) ?? "-1",
        rowCount: data?.result?.stats?.nreported ?? 0,
        manualPagination: true,
        onColumnVisibilityChange: setStoredColumns,
        state: {
            columnVisibility: storedColumns,
        },
        defaultColumn: {
            minSize: 100,
        },
    });

    useEffect(() => {
        if (data) {
            if (data.result?.stats.id !== stats?.id) {
                setStats(data.result?.stats);
            }
        }
    }, [data]);

    useEffect(() => {
        if (row > 0) {
            const rowRef = rowsRef.current[row - 1];

            if (rowRef) {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("animated");
                        }
                    },
                    { threshold: 1 },
                );

                observer.observe(rowRef);
                rowRef.scrollIntoView({ behavior: "smooth", block: "center" });

                return () => {
                    if (rowRef) {
                        observer.unobserve(rowRef);
                    }
                };
            }
        }
    }, [row, data]);

    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching your results...</p>
                <ProgressIndicator />
            </div>
        );

    if (pending(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">
                    Your job <b>{id}</b> is still running...
                </p>
                <ProgressIndicator />
            </div>
        );

    if (failed(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">
                    Your job <b>{id}</b> has failed!
                </p>
            </div>
        );
    
    if (!data) {
        return <NotFound title="Results not found" lede="We’re sorry - we can’t find the results you requested." message="It may have been removed or be temporarily unavailable."/>
    }

    return (
        <div className="vf-stack vf-stack--800">
            {algo !== "hmmsearch" && <Annotations id={id} />}
            {taxonomyIds.length === 0 && !architecture && algo !== "hmmscan" && <DistributionGraph id={id} />}
            <div className="vf-stack vf-stack--400">
                {algo !== "hmmscan" && <ResultFilter />}
                <div className="vf-stack vf-stack--200">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <SearchDetails id={id}/>
                        <Customization
                            open={customsationOpen}
                            onClick={() => setCustomsationOpen(!customsationOpen)}
                            onDefaultClick={() => {
                                setStoredColumns(defaultColumns);

                                setSearchParams((prevSearchParams) => {
                                    prevSearchParams.set("pageSize", _.toString(defaultPageSize));
                                    return prevSearchParams;
                                });

                                setStoredPageSize(defaultPageSize);
                            }}
                            table={table}
                            pageSizeOptions={[50, 100, 250, 1000]}
                            currentPageSize={pageSize}
                            onPageSizeChange={(pageSize) => {
                                setSearchParams((prevSearchParams) => {
                                    prevSearchParams.set("pageSize", _.toString(pageSize));
                                    return prevSearchParams;
                                });

                                setStoredPageSize(pageSize);
                            }}
                        />
                    </div>
                    <div className="table-container">
                        <table className="vf-table" style={{ height: "100%" }}>
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
                                {table.getRowModel().rows.map((row, index) => {
                                    return (
                                        <Fragment key={row.original.index}>
                                            <tr
                                                className="vf-table__row"
                                                ref={(element) => (rowsRef.current[index] = element)}
                                            >
                                                {/* first row is a normal row */}
                                                {row.getVisibleCells().map((cell) => {
                                                    return (
                                                        <td
                                                            key={cell.id}
                                                            className="vf-table__cell"
                                                            width={cell.column.getSize()}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                                                                        <td className="vf-table__cell" colSpan={999}>
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
                                                                <AlignmentView id={id} index={row.original.index!} />
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
                        pageCount={data?.page_count ?? 1}
                        onPageChange={(page) =>
                            setSearchParams((prevSearchParams) => {
                                prevSearchParams.set("page", _.toString(page));
                                prevSearchParams.delete("row");

                                return prevSearchParams;
                            })
                        }
                    />
                </div>
            </div>
        </div>
    );
};

interface CustomizationProps {
    open: boolean;
    onClick: () => void;
    onDefaultClick: () => void;
    table: Table<P7Hit>;
    currentPageSize: number;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions: number[];
}

const Customization: React.FC<CustomizationProps> = ({
    table,
    currentPageSize,
    onPageSizeChange,
    pageSizeOptions,
    open,
    onClick,
    onDefaultClick,
}) => {
    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 0,
            borderWidth: 2,
        },
        overlay: {
            zIndex: 99999,
        },
    };

    return (
        <>
            <button
                className="vf-button vf-button--primary vf-button--sm"
                onClick={(e) => {
                    e.preventDefault();
                    onClick();
                }}
            >
                Customise
            </button>
            <ReactModal style={customStyles} contentLabel="Customization" isOpen={open} onRequestClose={onClick}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onClick();
                        }}
                        className="vf-button vf-button--link"
                        style={{ margin: 0 }}
                        type="button"
                    >
                        <i className="icon icon-common icon-times" />
                    </button>
                </div>
                <div style={{ display: "flex", justifyContent: "start", gap: "5rem" }}>
                    <fieldset className="vf-form__fieldset vf-stack vf-stack--200 vf-text-body vf-text-body--3">
                        <legend className="vf-form__legend">Page Size</legend>
                        <select
                            id="pageSize"
                            className="vf-form__select"
                            value={currentPageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </fieldset>
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
                </div>
                <div className="vf-u-margin__top--800" style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDefaultClick();
                        }}
                        className="vf-button vf-button--sm vf-button--primary"
                        type="button"
                    >
                        Restore Defaults
                    </button>
                </div>
            </ReactModal>
        </>
    );
};
