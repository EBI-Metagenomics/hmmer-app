import _ from "lodash";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, Row } from "@tanstack/react-table";
import { JackhmmerResponseSchema } from "@/client/types.gen";
import { resultApiGetResultOptions, searchApiSearchMutation } from "@/client/@tanstack/react-query.gen";

import { JobStatus, ProgressIndicator } from "@/components/atoms";
import { pending } from "@/utils/taskStates";

const columnHelper = createColumnHelper<JackhmmerResponseSchema>();

const columns = [
    columnHelper.accessor("iteration", {
        header: "Iteration",
        cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) => row.original.iteration,
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) => <JobStatus status={row.original.status} />,
    }),
    columnHelper.accessor("id", {
        header: "Results",
        cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
            pending(row.original) ? (
                <ProgressIndicator width={380} />
            ) : row.original.status === "SUCCESS" ? (
                <NavLink to={`/results/${row.original.id}/score`}>{row.original.id}</NavLink>
            ) : (
                <span>{row.original.id}</span>
            ),
    }),
    columnHelper.group({
        header: "Hits",
        columns: [
            columnHelper.accessor("convergence_stats.gained", {
                header: "New",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.gained > 0 ? (
                        <span style={{ color: "#18974c" }}>+{row.original.convergence_stats.gained}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.lost", {
                header: "Lost",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.lost > 0 ? (
                        <span style={{ color: "#a6093d" }}>-{row.original.convergence_stats.lost}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.dropped", {
                header: "Dropped",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats && row.original.convergence_stats.dropped > 0 ? (
                        <span style={{ color: "#d32f2f" }}>{row.original.convergence_stats.dropped}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
            columnHelper.accessor("convergence_stats.total", {
                header: "Total",
                cell: ({ row }: { row: Row<JackhmmerResponseSchema> }) =>
                    row.original.convergence_stats ? (
                        <span>{row.original.convergence_stats.total}</span>
                    ) : (
                        <span>-</span>
                    ),
            }),
        ],
    }),
];

interface JackhmmerTableProps {
    id: string;
}

export const JackhmmerTable: React.FC<JackhmmerTableProps> = ({ id }) => {
    const [nextIterationEnabled, setNextIterationEnabled] = useState(false);
    const [lastIterationId, setLastIterationId] = useState<string>();

    const { data, isPending, refetch } = useQuery({
        ...resultApiGetResultOptions({ path: { id } }),
        refetchInterval(query) {
            if (
                _.every((query.state.data ?? []) as JackhmmerResponseSchema[], (jackhmmerIteration) => {
                    return jackhmmerIteration.status === "SUCCESS";
                })
            ) {
                return 5000;
            }

            return 1000;
        },
        refetchIntervalInBackground: true,
    });

    const { mutateAsync } = useMutation({
        ...searchApiSearchMutation(),
    });

    const table = useReactTable({
        data: (data ?? []) as JackhmmerResponseSchema[],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    useEffect(() => {
        if (!data) {
            setNextIterationEnabled(false);

            return;
        }

        if ((data as JackhmmerResponseSchema[]).length === 0 || (data as JackhmmerResponseSchema[]).length === 9) {
            setNextIterationEnabled(false);

            return;
        }

        if (
            _.some((data ?? []) as JackhmmerResponseSchema[], (jackhmmerIteration) => {
                return jackhmmerIteration.status !== "SUCCESS";
            })
        ) {
            setNextIterationEnabled(false);

            return;
        }

        const lastIteration = _.last(data as JackhmmerResponseSchema[]);

        if (
            (lastIteration?.convergence_stats?.gained ?? 0) === 0 &&
            (lastIteration?.convergence_stats?.dropped ?? 0) === 0 &&
            (lastIteration?.convergence_stats?.lost ?? 0) === 0
        ) {
            setNextIterationEnabled(false);

            return;
        }

        setLastIterationId(lastIteration?.id);
        setNextIterationEnabled(true);
    }, [data]);

    if (isPending)
        return (
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <h2 className="vf-text vf-text-heading--2">Jackhmmer Summary</h2>
                </div>

                <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                    <p className="vf-text-body vf-text-body--2">Fetching your Jackhmmer results...</p>
                    <ProgressIndicator />
                </div>
            </div>
        );

    if (((data ?? []) as JackhmmerResponseSchema[]).length === 0) {
        return (
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <h2 className="vf-text vf-text-heading--2">Jackhmmer Summary</h2>
                </div>

                <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                    <p className="vf-text-body vf-text-body--2">First iteration has not started yet...</p>
                    <ProgressIndicator />
                </div>
            </div>
        );
    }

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-u-padding__top--400">
                <h2 className="vf-text vf-text-heading--2">Jackhmmer Summary</h2>
            </div>
            <div>
                <table className="vf-table vf-u-width__100">
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
            <div>
                <button
                    className={`vf-button vf-button--sm ${!nextIterationEnabled ? "disabled vf-button--tertiary" : "vf-button--primary"}`}
                    onClick={() =>
                        nextIterationEnabled &&
                        mutateAsync(
                            {
                                path: { algo: "jackhmmer" },
                                body: {
                                    input: lastIterationId!,
                                    include: [],
                                    exclude: [],
                                    exclude_all: false,
                                    with_architecture: true,
                                    with_taxonomy: true,
                                },
                            },
                            {
                                onSuccess: () => refetch(),
                            },
                        )
                    }
                >
                    Run next iteration
                </button>
            </div>
        </div>
    );
};
