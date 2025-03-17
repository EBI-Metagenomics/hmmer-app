import _ from "lodash";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { downloadApiGetDownloadsOptions, downloadApiGenerateFileMutation } from "@/client/@tanstack/react-query.gen";
import { DownloadsResponseSchema } from "@/client";
import { ProgressIndicator } from "@/components/atoms";

import "./index.scss";

interface DownloadListProps {
    id: string;
}

export const DownloadList: React.FC<DownloadListProps> = ({ id }) => {
    const [downloads, setDownloads] = useState<DownloadsResponseSchema[]>([]);

    const { data, isPending, refetch } = useQuery({
        ...downloadApiGetDownloadsOptions({
            path: { id },
        }),
        refetchInterval(query) {
            if (
                _.some(query.state.data ?? [], (download) => {
                    return download.status === "GENERATING";
                })
            ) {
                return 1000;
            }

            return false;
        },
        refetchIntervalInBackground: true,
    });

    useEffect(() => {
        if (data) {
            setDownloads(data);
        }
    }, [data]);

    const { mutate } = useMutation({
        ...downloadApiGenerateFileMutation(),
        onSettled: async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await refetch();
        },
    });

    const bytesToHumanReadable = (bytes: number) => {
        if (!_.isNumber(bytes) || !_.isFinite(bytes) || bytes < 0) {
            return "0 B";
        }

        const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

        if (bytes === 0) return "0 B";

        const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));

        const clampedUnitIndex = _.clamp(unitIndex, 0, units.length - 1);

        const size = bytes / Math.pow(1024, clampedUnitIndex);

        return `${_.round(size, 1)} ${units[clampedUnitIndex]}`;
    };

    if (isPending) {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching available downloads...</p>
                <ProgressIndicator />
            </div>
        );
    }

    return (
        <div className="vf-grid vf-grid__col-3">
            {_.map(downloads, (item, index) => (
                <div key={index} className="vf-card vf-card--brand">
                    <div className="vf-card__content">
                        <div></div>
                        <h3 className="vf-card__heading">{item.name}</h3>
                        <p className="vf-card__text">{item.description}</p>

                        <div className="download-button-container vf-u-margin__top--200">
                            {item.status === "AVAILABLE" && (
                                <a className="vf-button vf-button--primary vf-button--sm" href={item.url ?? ""}>
                                    Download
                                </a>
                            )}
                            {item.status === "GENERATING" && (
                                <button disabled className="vf-button vf-button--secondary vf-button--sm">
                                    <span className="spinner"></span>Generating
                                </button>
                            )}
                            {item.status === "NOT_GENERATED" && (
                                <button
                                    className="vf-button vf-button--secondary vf-button--sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        mutate({ path: { id, format: item.format } });
                                        setDownloads(
                                            _.map(downloads, (download) =>
                                                download.format !== item.format
                                                    ? download
                                                    : { ...download, status: "GENERATING" },
                                            ),
                                        );
                                    }}
                                >
                                    Generate
                                </button>
                            )}
                            {item.status === "FAILED" && (
                                <button className="vf-button vf-button--secondary vf-button--sm">Failed</button>
                            )}
                            {item.size && (
                                <p className="vf-card__text vf-text-body vf-text-body--3">
                                    {bytesToHumanReadable(item.size)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
