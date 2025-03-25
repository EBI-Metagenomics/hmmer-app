import _ from "lodash";
import { useSearchParams } from "react-router";
import { useQueries } from "@tanstack/react-query";

import {
    taxonomyApiGetTaxonomyOptions,
    architectureApiGetArchitectureNameOptions,
} from "@/client/@tanstack/react-query.gen";
import { RemoveButton } from "@/components/atoms";

import "./index.scss";

export const ResultFilter: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const taxonomies = useQueries({
        queries: _.map(searchParams.getAll("taxonomyIds"), (taxonomyId) => ({
            ...taxonomyApiGetTaxonomyOptions({ path: { id: _.toInteger(taxonomyId) } }),
        })),
    });

    const architectures = useQueries({
        queries: _.map(searchParams.getAll("architectures"), (architectureAccessions) => ({
            ...architectureApiGetArchitectureNameOptions({ path: { accessions: architectureAccessions } }),
        })),
    });

    return (
        (searchParams.has("taxonomyIds") || searchParams.has("architectures")) && (
            <div className="vf-card">
                <div className="vf-card__content | vf-stack vf-stack--200">
                    <h4 className="vf-card__subheading" style={{ marginTop: 0 }}>
                        Your results have been filtered
                    </h4>
                    <div className="vf-stack vf-stack--200 vf-u-padding__left--400">
                        {searchParams.has("taxonomyIds") && (
                            <div style={{ display: "flex", justifyContent: "start", gap: "1.5rem" }}>
                                <div>
                                    <h5 className="vf-text vf-text-heading--5">Taxonomy</h5>
                                </div>
                                <div>
                                    {_.map(taxonomies, (taxonomy, index) => (
                                        <div className="taxonomy-item" key={index}>
                                            <span className="vf-badge vf-badge--primary">{taxonomy.data?.name}</span>
                                            <RemoveButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSearchParams((prevSearchParams) => {
                                                        prevSearchParams.delete(
                                                            "taxonomyIds",
                                                            _.toString(taxonomy.data?.taxonomy_id),
                                                        );
                                                        return prevSearchParams;
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {searchParams.has("architectures") && (
                            <div style={{ display: "flex", justifyContent: "start", gap: "1.5rem" }}>
                                <div>
                                    <h5 className="vf-text vf-text-heading--5">Architecture</h5>
                                </div>
                                <div>
                                    {_.map(architectures, (architecture, index) => (
                                        <div className="architecture-item" key={index}>
                                            <span className="vf-badge vf-badge--primary">
                                                {architecture.data?.names}
                                            </span>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    );
};
