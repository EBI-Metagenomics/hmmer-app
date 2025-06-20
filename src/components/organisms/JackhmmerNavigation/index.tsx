import { useState } from "react";
import { useNavigate, NavLink } from "react-router";
import ReactModal from "react-modal";
import { JobDetailsResponseSchema } from "@/client";
import { HmmdSearchStats } from "@/client";

import { jobConverged } from "@/utils/jackhmmer";

import "./index.scss";

interface JackhmmerNavigationProps {
    jobDetails: JobDetailsResponseSchema;
    stats?: HmmdSearchStats;
    sequenceSelection: "above" | "none" | "some";
    nextIterationEnabled: boolean;
    onRunNextIteration: (id: string) => void;
    onJumpToHit: (index: number) => void;
    onSequenceSelectionChange: (value: "above" | "none" | "some") => void;
}

export const JackhmmerNavigation: React.FC<JackhmmerNavigationProps> = ({
    jobDetails,
    stats,
    sequenceSelection,
    nextIterationEnabled,
    onRunNextIteration,
    onJumpToHit,
    onSequenceSelectionChange,
}) => {
    const navigate = useNavigate();

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-stack vf-stack--200">
                <div className="vf-text-body vf-text-body--1">
                    <span>
                        Iteration <b>{jobDetails.iteration}</b> {jobConverged(stats) && "Converged"}
                    </span>
                    {jobConverged(stats) && (
                        <p className="vf-text-body vf-text-body--2">Your jackhmmer search has reached convergence. No further iterations will be performed.</p>
                    )}
                </div>
                <div className="vf-stack vf-stack--200 vf-text-body vf-text-body--2">
                    <p>
                        <span>
                            Return to the{" "}
                            <NavLink className="vf-link" to={`/results/${jobDetails.parent_job_id}/score`}>
                                Result Summary
                            </NavLink>
                            {"  |"}
                        </span>
                        {(stats?.nlost ?? 0) > 0 && (
                            <span>
                                {"  "}
                                <b>{stats?.nlost ?? 0}</b> completely lost match |
                            </span>
                        )}
                        {(stats?.ndropped ?? 0) > 0 && (
                            <span>
                                {"  "}
                                <b>{stats?.ndropped ?? 0}</b> matches dropped below your threshold |
                            </span>
                        )}
                        {(stats?.ngained ?? 0) > 0 && (
                            <span>
                                {"  "}
                                <a
                                    className="vf-link"
                                    href=""
                                    onClick={() => onJumpToHit(stats?.first_gained_index ?? 0)}
                                >
                                    Jump to first new match
                                </a>
                                {"  |"}
                            </span>
                        )}
                        <span>
                            {"  "}
                            <a className="vf-link" href="" onClick={() => onJumpToHit(stats?.nincluded ?? 0)}>
                                Jump to threshold
                            </a>
                        </span>
                    </p>
                </div>
                {!jobConverged(stats) && (
                    <NextIterationComponent
                        currentIterationNumber={jobDetails.iteration ?? 0}
                        hasNextIteration={Boolean(jobDetails.next_job_id)}
                        onRun={() => onRunNextIteration(jobDetails.id!)}
                        enabled={nextIterationEnabled}
                    />
                )}
                <div className="navigation-container">
                    <div>
                        {jobDetails.previous_job_id && (
                            <button
                                className="vf-button vf-button--secondary vf-button--sm"
                                onClick={() => navigate(`/results/${jobDetails.previous_job_id}/score`)}
                            >
                                {"<< "}previous iteration
                            </button>
                        )}
                    </div>
                    <div>
                        {jobDetails.next_job_id && (
                            <button
                                className="vf-button vf-button--secondary vf-button--sm"
                                onClick={() => navigate(`/results/${jobDetails.next_job_id}/score`)}
                            >
                                next iteration{" >>"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {!jobConverged(stats) && (
                <fieldset className="vf-form__fieldset | vf-stack vf-stack--200">
                    <div className="vf-form__legend">Sequence selection</div>
                    <div className="vf-cluster vf-cluster--200">
                        <div className="vf-cluster__inner">
                            <div className="vf-form__item vf-form__item--radio">
                                <input
                                    type="radio"
                                    name="sequenceSelection"
                                    value="above"
                                    id="above"
                                    className="vf-form__radio"
                                    checked={sequenceSelection === "above"}
                                    // @ts-ignore
                                    onChange={(e) => onSequenceSelectionChange(e.target.value)}
                                />
                                <label htmlFor="above" className="vf-form__label">
                                    above threshold
                                </label>
                            </div>
                            <div className="vf-form__item vf-form__item--radio">
                                <input
                                    type="radio"
                                    name="sequenceSelection"
                                    value="none"
                                    id="none"
                                    className="vf-form__radio"
                                    checked={sequenceSelection === "none"}
                                    // @ts-ignore
                                    onChange={(e) => onSequenceSelectionChange(e.target.value)}
                                />
                                <label htmlFor="none" className="vf-form__label">
                                    unselect all
                                </label>
                            </div>
                        </div>
                    </div>
                    {sequenceSelection === "some" && (
                        <p className="vf-form__helper vf-form__helper--error">
                            The above default selection has been manually modified. If you switch the default selection
                            again, your current selection will be lost.
                        </p>
                    )}
                </fieldset>
            )}
        </div>
    );
};

interface NextIterationComponentProps {
    currentIterationNumber: number;
    hasNextIteration: boolean;
    enabled: boolean;
    onRun: () => void;
}

const NextIterationComponent: React.FC<NextIterationComponentProps> = ({
    currentIterationNumber,
    hasNextIteration,
    enabled,
    onRun,
}) => {
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
        },
        overlay: {
            zIndex: 99999,
        },
    };

    return (
        <div className="run-container">
            {hasNextIteration ? (
                <>
                    <button
                        className={`vf-button vf-button--sm ${!enabled ? "disabled vf-button--tertiary" : "vf-button--primary"}`}
                        onClick={() => enabled && setOpen(true)}
                    >
                        Rerun iteration {currentIterationNumber + 1}
                    </button>
                    <ReactModal
                        style={customStyles}
                        contentLabel="Customization"
                        isOpen={open}
                        onRequestClose={() => setOpen(false)}
                    >
                        <div className="vf-stack vf-stack--800">
                            <div>
                                <p className="warning-text vf-text-body vf-text-body--2">
                                    Warning, this will replace iteration {currentIterationNumber + 1} and delete
                                    iterations that rely on the data produced by it.
                                </p>
                            </div>
                            <div className="button-container">
                                <button className="vf-button vf-button--primary vf-button--sm" onClick={() => onRun()}>
                                    Confirm
                                </button>
                                <button
                                    className="vf-button vf-button--secondary vf-button--sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </ReactModal>
                </>
            ) : (
                <button
                    className={`vf-button vf-button--sm ${!enabled ? "disabled vf-button--tertiary" : "vf-button--primary"}`}
                    onClick={() => enabled && onRun()}
                >
                    Run iteration {currentIterationNumber + 1}
                </button>
            )}
        </div>
    );
};
