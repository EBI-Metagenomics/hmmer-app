import _ from "lodash";
import { useState } from "react";
import { JobDetailsResponseSchema } from "@/client";
import ReactModal from "react-modal";

import { ProgressIndicator } from "@/components/atoms";

import "./index.scss";

interface SearchDetailsProps {
    data?: JobDetailsResponseSchema;
}

export const SearchDetails: React.FC<SearchDetailsProps> = ({ data }) => {
    const [open, setOpen] = useState<boolean>(false);

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
            padding: "2rem"
        },
        overlay: {
            zIndex: 99999,
        },
    };

    const makeCmdString = (job: JobDetailsResponseSchema) => {
        const paramKeys = ["E", "domE", "T", "domT", "incE", "incdomE", "incT", "incdomT", "popen", "pextend", "mx"];

        const params = _(job)
            .toPairs()
            .filter((pair) => Boolean(pair[1]))
            .filter((pair) => _.includes(paramKeys, pair[0]))
            .map((pair) => {
                if (pair[0] === "E" || pair[0] === "T") return `-${pair[0]} ${pair[1]}`;

                return `--${pair[0]} ${pair[1]}`;
            })
            .join(" ");

        const databaseParam = `${job.algo === "hmmscan" ? "--hmmdb" : "--seqdb"} ${job.database.id}`;

        return `${job.algo} ${params} ${databaseParam}`;
    };

    const makeQueryString = (job: JobDetailsResponseSchema) => {
        if (job.algo === "hmmsearch") {
            return job.input;
        }

        const [header, ...sequences] = _(job.input).split("\n").value();
        const aminoAcids = _.flatMap(sequences, (sequence) => _.split(sequence, ""));
        const splitSquences = _(aminoAcids)
            .chunk(60)
            .map((x) => x.join(""))
            .join("\n");

        return `${header}\n${splitSquences}`;
    };

    const makeDatabaseString = (job: JobDetailsResponseSchema) => {
        return `${job.database.name}, version ${job.database.version}, downloaded on ${new Date(job.database.release_date ?? "").toLocaleDateString()}`;
    };

    const makeJobURL = (job: JobDetailsResponseSchema) => window.location.href

    if (!data) {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching job details...</p>
                <ProgressIndicator />
            </div>
        );
    }

    return (
        <>
            <button
                className="vf-button vf-button--primary vf-button--sm"
                onClick={(e) => {
                    e.preventDefault();
                    setOpen(!open);
                }}
            >
                Search Details
            </button>
            <ReactModal style={customStyles} isOpen={open} onRequestClose={() => setOpen(false)}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setOpen(!open);
                        }}
                        className="vf-button vf-button--link"
                        style={{ margin: 0 }}
                        type="button"
                    >
                        <i className="icon icon-common icon-times" />
                    </button>
                </div>
                <div className="vf-stack vf-stack--800">
                    <div>
                        Your job ran as{" "}
                        <a className="vf-link" href={makeJobURL(data)}>
                            {data.id}
                        </a>
                        . This link to your results will be valid for up to one week.
                    </div>
                    <div className="search-details-container">
                        <div>Started on</div>
                        <pre>{data.task ? new Date(data.task.date_created).toLocaleString() : ""}</pre>
                        <div>Finished on</div>
                        <pre>{data.task ? new Date(data.task.date_done).toLocaleString() : ""}</pre>
                        <div>Command</div>
                        <pre>{makeCmdString(data)}</pre>
                        <div>Database</div>
                        <pre>{makeDatabaseString(data)}</pre>
                        <div>Search {data.algo === "hmmsearch" ? "alignment/hmm" : "sequence"}</div>
                        <div className="query-container">
                            <a
                                className="vf-link"
                                href={`${import.meta.env.VITE_API_URL}/api/v1/search/${data.id}/query`}
                            >
                                <pre>{makeQueryString(data)}</pre>
                            </a>
                        </div>
                    </div>
                </div>
            </ReactModal>
        </>
    );
};
