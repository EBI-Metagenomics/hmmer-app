import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { differenceInSeconds } from "date-fns";
import { useSearchParams, useNavigate, NavLink } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { searchApiSearchMutation, searchApiGetJobDetailsOptions } from "@/client/@tanstack/react-query.gen";

import ReactModal from "react-modal";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    Row,
    RowData,
    Table,
} from "@tanstack/react-table";

import { TreeToggleButton, HitPosition, Alignment, ProgressIndicator, NotFound } from "@components/atoms";
import { Pagination } from "@components/molecules";
import {
    Annotations,
    AlignmentView,
    ResultFilter,
    DistributionGraph,
    SearchDetails,
    JackhmmerNavigation,
    NotificationPrompt,
} from "@components/organisms";
import { P7Hit, ResultResponseSchema } from "@/client/types.gen";
import { useResult } from "@/hooks/useResult";
import { useColumns, usePageSize, useStats, defaultColumns, defaultPageSize, useJackhmmer } from "@/context";
import { pending, failed } from "@/utils/taskStates";
import { jobConverged } from "@/utils/jackhmmer";

import "./index.scss";

declare module "@tanstack/table-core" {
    interface TableMeta<TData extends RowData> {
        excludeAll: boolean;
        include?: number[];
        exclude?: number[];
    }
}

const isChecked = (
    sequenceIndex: number,
    aboveThreshold: boolean,
    include: number[],
    exclude: number[],
    excludeAll: boolean,
) => {
    if (excludeAll || !aboveThreshold) return _.includes(include, sequenceIndex);

    return !_.includes(exclude, sequenceIndex);
};

const columnHelper = createColumnHelper<P7Hit>();

const columns = (onHitChange: (index: number, aboveThreshold: boolean, isChecked: boolean) => void) => [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return <TreeToggleButton isOpen={row.getIsExpanded()} />;
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
                <a
                    href={(row.original.metadata?.external_link as string) ?? ""}
                    className="vf-link"
                    onClick={(e) => e.stopPropagation()}
                >
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
                <a
                    href={(row.original.metadata?.taxonomy_link as string) ?? ""}
                    className="vf-link"
                    onClick={(e) => e.stopPropagation()}
                >
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
                            <a href={external_link} className="vf-link" onClick={(e) => e.stopPropagation()}>
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
    {
        id: "rowCheck",
        header: "",
        maxSize: 10,
        enableHiding: false,
        cell: ({ row, table }: { row: Row<P7Hit>; table: Table<P7Hit> }) => (
            <div className="vf-form__item vf-form__item--checkbox" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isChecked(
                        row.original.seqidx,
                        row.original.is_included ?? false,
                        table.options.meta?.include ?? [],
                        table.options.meta?.exclude ?? [],
                        table.options.meta?.excludeAll ?? false,
                    )}
                    id={`rowCheck-${row.original.seqidx}`}
                    className="vf-form__checkbox"
                    onChange={(e) => onHitChange(row.original.seqidx!, row.original.is_included ?? false, e.target.checked)
                    }
                />
                <label htmlFor={`rowCheck-${row.original.seqidx}`} className="vf-form__label" />
            </div>
        ),
    },
];

const hmmscanColumns = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }: { row: Row<P7Hit> }) => {
            return <TreeToggleButton isOpen={row.getIsExpanded()} />;
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
                        <a
                            href={(row.original.metadata?.external_link as string) ?? ""}
                            className="vf-link"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                <a
                    href={(row.original.metadata?.clan_link as string) ?? ""}
                    className="vf-link"
                    onClick={(e) => e.stopPropagation()}
                >
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
    const navigate = useNavigate();
    const [customsationOpen, setCustomsationOpen] = useState(false);
    const [sequenceSelection, setSequenceSelection] = useState<"above" | "none" | "some">("above");
    const [promptPeriodPassed, setPromptPeriodPassed] = useState(false);
    const [storePageSize, setStoredPageSize] = usePageSize();
    const [storedColumns, setStoredColumns] = useColumns();
    const [stats, setStats] = useStats();
    const [changes, setChanges] = useJackhmmer();

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

    const { data, isPending } = useResult(
        id!,
        page,
        pageSize,
        storedColumns.hitPositions,
        taxonomyIds,
        architecture,
    ) as { data: ResultResponseSchema; isPending: boolean };

    const { data: jobDetails } = useQuery({
        ...searchApiGetJobDetailsOptions({ path: { id: id! } }),
        refetchIntervalInBackground: true,
    });

    const algo = data?.result?.stats.algo ?? "unknown";

    const defaultData = useMemo(() => [], []);

    const { mutateAsync } = useMutation({
        ...searchApiSearchMutation(),
    });

    const handleNextIteration = (id: string) => {
        mutateAsync(
            {
                path: { algo: "jackhmmer" },
                body: {
                    input: id,
                    include: changes?.include,
                    exclude: changes?.exclude,
                    exclude_all: changes.excludeAll,
                    with_architecture: true,
                    with_taxonomy: true,
                },
            },
            {
                onSuccess: (data) => {
                    navigate(`/results/${data.id}`);
                },
            },
        );
    };

    const handleJumpToHit = (index: number) => {
        const page = _.floor(index / pageSize) + 1;
        const row = (index % pageSize) + 1;

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("page", _.toString(page));
        newSearchParams.set("pageSize", _.toString(pageSize));
        newSearchParams.set("row", _.toString(row));

        navigate({
            pathname: `/results/${id}/score`,
            search: newSearchParams.toString(),
        });
    };

    const handleCheckChange = (index: number, aboveThreshold: boolean, isChecked: boolean) => {
        let newChanges = changes;

        if (changes.excludeAll || !aboveThreshold) {
            if (isChecked) newChanges = { ...changes, include: [...changes.include, index] };
            else newChanges = { ...changes, include: _.without(changes.include, index) };
        } else {
            if (isChecked) newChanges = { ...changes, exclude: _.without(changes.exclude, index) };
            else newChanges = { ...changes, exclude: [...changes.exclude, index] };
        }

        setChanges(newChanges);

        if (newChanges.excludeAll && newChanges.include.length === 0) setSequenceSelection("none");
        if (!newChanges.excludeAll && newChanges.include.length === 0 && newChanges.exclude.length === 0)
            setSequenceSelection("above");
        if (newChanges.include.length !== 0 || newChanges.exclude.length !== 0) setSequenceSelection("some");
    };

    const getColumns = () => {
        if (algo === "hmmscan") return hmmscanColumns;

        let columnsToReturn = columns(handleCheckChange);

        if (stats?.database === "pdb") columnsToReturn = _.reject(columnsToReturn, ["id", "structures"]);
        if (stats?.algo !== "jackhmmer" || jobConverged(stats))
            columnsToReturn = _.reject(columnsToReturn, ["id", "rowCheck"]);

        return columnsToReturn;
    };

    const table = useReactTable({
        data: data?.result?.hits ?? defaultData,
        columns: getColumns(),
        getRowCanExpand: (row) => row.original.nreported > 0,
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
        meta: {
            include: changes.include,
            exclude: changes.exclude,
            excludeAll: changes.excludeAll,
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
        if (jobDetails) {
            setChanges({
                include: jobDetails.include ?? [],
                exclude: jobDetails.exclude ?? [],
                excludeAll: jobDetails.exclude_all ?? false,
            });
            if (jobDetails.exclude_all && jobDetails.include.length === 0) setSequenceSelection("none");
            if (!jobDetails.exclude_all && jobDetails.include.length === 0 && jobDetails.exclude.length === 0)
                setSequenceSelection("above");
            if (jobDetails.include.length !== 0 || jobDetails.exclude.length !== 0) setSequenceSelection("some");
        }
    }, [jobDetails]);

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

    useEffect(() => {
        if (sequenceSelection === "above") {
            setChanges({ include: [], exclude: [], excludeAll: false });
        }

        if (sequenceSelection === "none") {
            setChanges({ include: [], exclude: [], excludeAll: true });
        }
    }, [sequenceSelection]);

    useEffect(() => {
        const secondsSinceSubmitted = (date: Date) => differenceInSeconds(new Date(), date);

        const checkPromptPeriod = () => {
            if (!jobDetails) return;
            if (!jobDetails.date_submitted) return;

            if (pending(jobDetails.task) && secondsSinceSubmitted(jobDetails.date_submitted) > 3 * 60)
                setPromptPeriodPassed(true);
        };

        checkPromptPeriod();

        const interval = setInterval(checkPromptPeriod, 1000);

        return () => clearInterval(interval);
    }, []);

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
                {promptPeriodPassed && (
                    <NotificationPrompt id={id} email_address={jobDetails?.email_address ?? undefined} />
                )}
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
        return (
            <NotFound
                title="Results not found"
                lede="We’re sorry - we can’t find the results you requested."
                message="It may have been removed or be temporarily unavailable."
            />
        );
    }

    return (
        <div className="vf-stack vf-stack--800">
            {algo === "jackhmmer" && jobDetails && (
                <JackhmmerNavigation
                    jobDetails={jobDetails}
                    stats={data.result?.stats}
                    sequenceSelection={sequenceSelection}
                    nextIterationEnabled={!changes.excludeAll || changes.include.length > 0}
                    onRunNextIteration={handleNextIteration}
                    onJumpToHit={handleJumpToHit}
                    onSequenceSelectionChange={setSequenceSelection}
                />
            )}
            {algo !== "jackhmmer" && jobDetails?.parent_job_id && (
                <NavLink
                    className="vf-button vf-button--secondary vf-button--sm"
                    to={`/results/${jobDetails.parent_job_id}/score`}
                >
                    Go to Batch job summary
                </NavLink>
            )}
            {algo !== "hmmsearch" && algo !== "jackhmmer" && <Annotations id={id} />}
            {taxonomyIds.length === 0 && !architecture && algo !== "hmmscan" && <DistributionGraph id={id} />}
            <div className="vf-stack vf-stack--400">
                {algo !== "hmmscan" && <ResultFilter />}
                <div className="vf-stack vf-stack--200">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <SearchDetails data={jobDetails} />
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
                                    const isInsignificant = !row.original.is_included;
                                    const hasPreviousRow = row.index > 0;
                                    const isFirstBelowThreshold =
                                        isInsignificant &&
                                        hasPreviousRow &&
                                        table.getRowModel().rows[row.index - 1].original.is_included;
                                    const significantNoHits = row.original.is_included && row.original.nincluded === 0;

                                    const isNew = row.original.is_new ?? false;
                                    const isDropped = row.original.is_dropped ?? false;

                                    return (
                                        <Fragment key={row.original.index}>
                                            <tr
                                                className={`vf-table__row expandable-row ${isFirstBelowThreshold ? "first-below-threshold" : ""} ${isInsignificant ? "insignificant" : ""} ${significantNoHits ? "significant-no-hits" : ""} ${isNew ? "is-new" : ""} ${isDropped ? "is-dropped" : ""}`}
                                                ref={(element) => (rowsRef.current[index] = element)}
                                                onClick={row.getToggleExpandedHandler()}
                                            >
                                                {/* first row is a normal row */}
                                                {row.getVisibleCells().map((cell) => {
                                                    return (
                                                        <td
                                                            key={cell.id}
                                                            className={`vf-table__cell ${cell.column.id === "accession" ? "accession-cell" : ""}`}
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
                <div className="vf-u-margin__top--800" style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDefaultClick();
                        }}
                        className="vf-button vf-button--sm vf-button--secondary"
                        type="button"
                    >
                        Restore Defaults
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onClick();
                        }}
                        className="vf-button vf-button--sm vf-button--primary"
                        type="button"
                    >
                        Close
                    </button>
                </div>
            </ReactModal>
        </>
    );
};
