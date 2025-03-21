import _ from "lodash";
import { useSearchParams } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { architectureApiGetArchitectureNameOptions } from "@/client/@tanstack/react-query.gen";
import { RemoveButton } from "@/components/atoms";

import "./index.scss";

export const ArchitectureFilter: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const architectures = useQueries({
        queries: _.map(searchParams.getAll("architectures"), (architectureAccessions) => ({
            ...architectureApiGetArchitectureNameOptions({ path: { accessions: architectureAccessions } }),
        })),
    });

    if (searchParams.has("architectures")) {
        return (
            searchParams.has("architectures") && (
                <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
                    <legend className="vf-form__legend">Architecture</legend>
                    <div className="vf-stack vf-stack--200 vf-u-padding__left--100 vf-u-padding__right--100">
                        {_.map(architectures, (architecture, index) => (
                            <div className="architecture-item" key={index}>
                                <span className="vf-badge vf-badge--primary">{architecture.data?.names}</span>
                                <RemoveButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSearchParams((prevSearchParams) => {
                                            prevSearchParams.delete(
                                                "architectures",
                                                _.toString(architecture.data?.accessions),
                                            );
                                            return prevSearchParams;
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </fieldset>
            )
        );
    }
};
