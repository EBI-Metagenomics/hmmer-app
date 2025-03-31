import _ from "lodash";
import { Route, Routes, useNavigate, useMatch, useSearchParams } from "react-router";

// @ts-ignore
import VfTabs from "@visual-framework/vf-tabs/vf-tabs.react.js";

import { ResultTable, TaxonomyElement, DomainArchitectureList, DownloadList } from "@components/organisms";
import { useStats } from "@/context";

const ResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const route = useMatch(`/results/:id/:tab`);
    const matchedPath = route?.params.tab;
    const id = route?.params.id;

    const [stats] = useStats();

    return (
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

                                    navigate({ pathname: `/results/${id}/download`, search: search.toString() });
                                }}
                                className={`vf-tabs__link ${matchedPath === "download" ? "is-active" : ""}`}
                            >
                                Download
                            </a>
                        </li>
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
    );
};

export default ResultsPage;
