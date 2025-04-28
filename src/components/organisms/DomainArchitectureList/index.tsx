import _ from "lodash";
import { useRef, useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    Row,
    Table,
    RowData,
} from "@tanstack/react-table";
// @ts-ignore
import DomainGraphic from "domain-gfx";

import {
    architectureApiGetDomainArchitecturesOptions,
    architectureApiGetAllArchitecturesOptions,
} from "@/client/@tanstack/react-query.gen";
import { ArchitectureAggregationSchema, ArchitectureSchema } from "@/client/types.gen";
import { ProgressIndicator, TreeToggleButton } from "@/components/atoms";
import { pending, failed, ready } from "@/utils/taskStates";
import "./index.scss";

declare module "@tanstack/table-core" {
    interface TableMeta<TData extends RowData> {
        resultId: string;
    }
}

interface DomainArchitectureListProps {
    id: string;
}

const columnHelper = createColumnHelper<ArchitectureAggregationSchema>();

const columns = [
    {
        id: "expander",
        header: () => null,
        cell: ({ row }: { row: Row<ArchitectureAggregationSchema> }) => {
            return <TreeToggleButton onClick={row.getToggleExpandedHandler()} isOpen={row.getIsExpanded()} />;
        },
        enableHiding: false,
        maxSize: 10,
    },
    columnHelper.accessor("architecture.names", {
        header: "Domain Architecture",
        cell: ({ row }) => {
            return <DomainGraphics architecture={row.original.architecture} showName showExample/>;
        },
    }),
    columnHelper.accessor("count", {
        header: "Count",
    }),
    {
        id: "show",
        header: "",
        cell: ({
            row,
            table,
        }: {
            row: Row<ArchitectureAggregationSchema>;
            table: Table<ArchitectureAggregationSchema>;
        }) => {
            return (
                <Link
                    to={{
                        pathname: `/results/${table.options.meta?.resultId}/score`,
                        search: `?architectures=${row.original.architecture.accessions}`,
                    }}
                    className="vf-link"
                >
                    View Scores
                </Link>
            );
        },
    },
];

export const DomainArchitectureList: React.FC<DomainArchitectureListProps> = ({ id }) => {
    const { data, isPending } = useQuery({
        ...architectureApiGetDomainArchitecturesOptions({ path: { id } }),
        refetchInterval(query) {
            if (ready(query.state.data) || failed(query.state.data)) return false;

            return Math.min(1000 * 2 ** query.state.dataUpdateCount, 5 * 60 * 1000);
        },
    });

    const table = useReactTable({
        data: data?.architectures ?? [],
        columns,
        meta: {
            resultId: id,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowCanExpand: () => true,
    });

    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching domain architecture...</p>
                <ProgressIndicator />
            </div>
        );

    if (pending(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Domain architecture generation is still running...</p>
                <ProgressIndicator />
            </div>
        );

    if (failed(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Domain architecture generation has failed!</p>
            </div>
        );

    return (
        <table className="vf-table vf-table--compact vf-u-width__100 domain-table">
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
                        <>
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
                            {row.getIsExpanded() && (
                                <>
                                    {/* This empty row is for keeping the embl alternating colors for the table */}
                                    <tr className="vf-table__row" hidden>
                                        <td className="vf-table__cell"></td>
                                    </tr>
                                    <tr>
                                        {/* 2nd row is a custom 1 cell row */}
                                        <td colSpan={row.getVisibleCells().length} className="domain-cell">
                                            <DomainGraphicsList
                                                id={id}
                                                architectureName={row.original.architecture.names}
                                            />
                                        </td>
                                    </tr>
                                </>
                            )}
                        </>
                    );
                })}
            </tbody>
        </table>
    );
};


const parseGraphics = (graphicsString: string) => {
    try {
        return JSON.parse(graphicsString);
    } catch (e1) {
        try {
            const firstParse = JSON.parse(graphicsString);
            return JSON.parse(firstParse);
        } catch (e2) {
            return null;
        }
    }
}

interface DomainGraphicsProps {
    architecture: ArchitectureSchema;
    showName?: boolean;
    showExample?: boolean;
}

const DomainGraphics: React.FC<DomainGraphicsProps> = ({ architecture, showName, showExample }) => {
    const graphicsContainerRef = useRef<HTMLDivElement>(null);
    const graphicsRef = useRef<HTMLDivElement>(null);
    const [shouldNudge, setShouldNudge] = useState<boolean>(false);
    const graphics = parseGraphics(architecture.graphics);

    useEffect(() => {
        const graphicsElement = new DomainGraphic({
            data: graphics,
            parent: graphicsRef.current,
        });

        return graphicsElement.delete;
    }, [graphics]);

    useEffect(() => {
        if (graphicsContainerRef.current) {
            setShouldNudge(graphicsContainerRef.current.scrollWidth > graphicsContainerRef.current.clientWidth);
        }
    }, []);

    const compressDomainString = (domainString: string) => {
        const domains = domainString.split(" ");

        const grouped = [];
        let current: string | undefined = undefined;
        let count = 0;

        _.forEach(domains, (domain) => {
            if (domain === current) {
                count++;
            } else {
                if (current) {
                    grouped.push({ domain: current, count });
                }
                current = domain;
                count = 1;
            }
        });

        if (current) {
            grouped.push({ domain: current, count });
        }

        const result = _.map(grouped, (group) => {
            if (group.count === 1) {
                return group.domain;
            } else {
                return `${group.domain} x${group.count}`;
            }
        }).join(", ");

        return result;
    };

    const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!e.deltaX && !e.deltaY) {
            return;
        }

        e.preventDefault();
        e.currentTarget.scrollLeft += e.deltaX + e.deltaY;
    };

    return (
        <div className="architecture-container">
            <div style={{ display: "flex", gap: "1rem" }}>
                {showName && <span style={{ fontWeight: 600 }}>{compressDomainString(architecture.names)}</span>}
                {showExample && architecture.sequence_external_link && (
                    <span>
                        example:{" "}
                        <a href={architecture.sequence_external_link} className="vf-link">
                            {architecture.sequence_accession}
                        </a>
                    </span>
                )}
            </div>
            <div
                ref={graphicsContainerRef}
                className={`graphics-container ${shouldNudge ? "with-nudge" : ""}`}
                onWheel={handleScroll}
            >
                <div ref={graphicsRef} />
                <div>
                    <span className="vf-text-body vf-text-body--5">{graphics.length}</span>
                </div>
            </div>
        </div>
    );
};

interface DomainGraphicsListProps {
    id: string;
    architectureName: string;
}

const DomainGraphicsList: React.FC<DomainGraphicsListProps> = ({ id, architectureName }) => {
    const { data, status } = useQuery({
        ...architectureApiGetAllArchitecturesOptions({ path: { id: id!, name: architectureName } }),
        refetchInterval(query) {
            if (query.state.data?.status === "SUCCESS") return false;
            if (query.state.data?.status === "FAILURE") return false;

            return Math.min(1000 * 2 ** query.state.dataUpdateCount, 5 * 60 * 1000);
        },
        refetchIntervalInBackground: true,
    });

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
            {_.map(data.architectures, (architecture, index) => (
                <DomainGraphics key={index} architecture={architecture}/>
            ))}
        </div>
    );
};
