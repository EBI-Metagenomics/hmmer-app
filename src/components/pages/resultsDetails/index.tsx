import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { Route, Routes, useNavigate, useMatch, useSearchParams } from "react-router";
// @ts-ignore
import VfTabs from "@visual-framework/vf-tabs/vf-tabs.react.js";

import { searchApiGetJobDetailsOptions } from "@/client/@tanstack/react-query.gen";

import { ProgressIndicator } from "@/components/atoms";

import {
    ResultTable,
    TaxonomyElement,
    DomainArchitectureList,
    DownloadList,
    JackhmmerTable,
    BatchTable,
} from "@components/organisms";
import { useStats, JackhmmerProvider } from "@/context";

const ResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const route = useMatch(`/results/:id/:tab`);
    const matchedPath = route?.params.tab;
    const id = route?.params.id;

    const [stats] = useStats();

    const { data, isPending } = useQuery({
        ...searchApiGetJobDetailsOptions({ path: { id: id! } }),
        refetchIntervalInBackground: true,
    });

    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching job details...</p>
                <ProgressIndicator />
            </div>
        );

    if (data?.algo == "jackhmmer" && data.iteration === 0) return <JackhmmerTable id={id!} />;

    if (_.startsWith(data?.input_type ?? "", "multi")) return <BatchTable id={id!}/>;

    return (
        <JackhmmerProvider>
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <h2 className="vf-text vf-text-heading--2">Browse {_.capitalize(stats?.algo ?? "")} Results</h2>
                </div>
                <div className="vf-stack vf-stack--200">
                    <div className="vf-tabs  | vf-u-padding__bottom--800">
                        <ul className="vf-tabs__list">
                            <li className="vf-tabs__item">
                                <a
                                    role="tab"
                                    // aria-selected={activeTab === tab.id}
                                    // aria-controls={`${tab.id}-tab`}
                                    onClick={() => {
                                        const search = new URLSearchParams();

                                        if (searchParams.has("architectures")) {
                                            search.append("architectures", searchParams.get("architectures") ?? "");
                                        }

                                        if (searchParams.has("taxonomyIds")) {
                                            _.each(searchParams.getAll("taxonomyIds"), (value) =>
                                                search.append("taxonomyIds", value),
                                            );
                                        }

                                        navigate({ pathname: `/results/${id}/score`, search: search.toString() });
                                    }}
                                    className={`vf-tabs__link ${matchedPath === "score" ? "is-active" : ""}`}
                                >
                                    Score
                                </a>
                            </li>
                            {stats && stats?.algo !== "hmmscan" && (
                                <li className="vf-tabs__item">
                                    <a
                                        role="tab"
                                        // aria-selected={activeTab === tab.id}
                                        // aria-controls={`${tab.id}-tab`}
                                        onClick={() => navigate(`/results/${id}/taxonomy`)}
                                        className={`vf-tabs__link ${matchedPath === "taxonomy" ? "is-active" : ""}`}
                                    >
                                        Taxonomy
                                    </a>
                                </li>
                            )}
                            {stats && stats?.algo !== "hmmscan" && (
                                <li className="vf-tabs__item">
                                    <a
                                        role="tab"
                                        // aria-selected={activeTab === tab.id}
                                        // aria-controls={`${tab.id}-tab`}
                                        onClick={() => navigate(`/results/${id}/domain`)}
                                        className={`vf-tabs__link ${matchedPath === "domain" ? "is-active" : ""}`}
                                    >
                                        Domain
                                    </a>
                                </li>
                            )}
                            {stats && (
                                <li className="vf-tabs__item">
                                    <a
                                        role="tab"
                                        // aria-selected={activeTab === tab.id}
                                        // aria-controls={`${tab.id}-tab`}
                                        onClick={() => {
                                            const search = new URLSearchParams();

                                            if (searchParams.has("architectures")) {
                                                search.append("architectures", searchParams.get("architectures") ?? "");
                                            }

                                            if (searchParams.has("taxonomyIds")) {
                                                _.each(searchParams.getAll("taxonomyIds"), (value) =>
                                                    search.append("taxonomyIds", value),
                                                );
                                            }

                                            navigate({
                                                pathname: `/results/${id}/download`,
                                                search: search.toString(),
                                            });
                                        }}
                                        className={`vf-tabs__link ${matchedPath === "download" ? "is-active" : ""}`}
                                    >
                                        Download
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                    <Routes>
                        <Route path="score" element={<ResultTable id={id!} />} />
                        <Route path="taxonomy" element={<TaxonomyElement id={id!} />} />
                        <Route path="domain" element={<DomainArchitectureList id={id!} />} />
                        <Route path="download" element={<DownloadList id={id!} />} />
                    </Routes>
                </div>
            </div>
        </JackhmmerProvider>
    );
};

export default ResultsPage;
