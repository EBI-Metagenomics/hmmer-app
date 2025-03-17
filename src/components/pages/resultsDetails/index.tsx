import _ from "lodash";
import { Route, Routes, useNavigate, useMatch, useSearchParams } from "react-router";

// @ts-ignore
import VfTabs from "@visual-framework/vf-tabs/vf-tabs.react.js";

import { useResult } from "@/hooks/useResult";

import { ResultTable, TaxonomyElement, DomainArchitectureList, DownloadList } from "@components/organisms";

const ResultsPage: React.FC = () => {
    const navigate = useNavigate();
    const route = useMatch(`/results/:id/:tab`);
    const matchedPath = route?.params.tab;
    const id = route?.params.id;

    const [searchParams] = useSearchParams({
        page: _.toString(1),
        pageSize: _.toString(50),
    });

    const page = _.toInteger(searchParams.get("page"));
    const pageSize = _.toInteger(searchParams.get("pageSize"));
    const taxonomyIds = searchParams.getAll("taxonomyIds").map(_.toInteger);
    const architecture = searchParams.get("architectures") || undefined;
    const storedColumnVisibility = JSON.parse(localStorage.getItem("columnVisibility") ?? "{}");

    const { data } = useResult(id!, page, pageSize, storedColumnVisibility.hitPositions, taxonomyIds, architecture);

    return (
        <div className="vf-stack vf-stack--800">
            <div className="vf-u-padding__top--800">
                <h2 className="vf-text vf-text-heading--2">Browse Results</h2>
            </div>
            <div className="vf-stack vf-stack--200">
                <div className="vf-tabs  | vf-u-padding__bottom--800">
                    <ul className="vf-tabs__list">
                        <li className="vf-tabs__item">
                            <a
                                role="tab"
                                // aria-selected={activeTab === tab.id}
                                // aria-controls={`${tab.id}-tab`}
                                onClick={() => navigate(`/results/${id}/score`)}
                                className={`vf-tabs__link ${matchedPath === "score" ? "is-active" : ""}`}
                            >
                                Score
                            </a>
                        </li>
                        {data?.result?.stats.algo !== "hmmscan" && (
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
                        {data?.result?.stats.algo !== "hmmscan" && (
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
                                onClick={() => navigate(`/results/${id}/download`)}
                                className={`vf-tabs__link ${matchedPath === "download" ? "is-active" : ""}`}
                            >
                                Download
                            </a>
                        </li>
                    </ul>
                </div>
                <Routes>
                    <Route path="score" element={<ResultTable data={data} id={id!} />} />
                    <Route path="taxonomy" element={<TaxonomyElement id={id!} />} />
                    <Route path="domain" element={<DomainArchitectureList id={id!} />} />
                    <Route path="download" element={<DownloadList id={id!} />} />
                </Routes>
            </div>
        </div>
    );
};

export default ResultsPage;
