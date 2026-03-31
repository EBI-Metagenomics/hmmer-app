import { Route, Routes, useNavigate, useMatch } from "react-router";

import { NotFound } from "@/components/atoms";
import { Form } from "@components/organisms";

const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const route = useMatch(`/search/:algo`);
    const algo = route?.params.algo;

    return (
        <>
            <div className="vf-stack vf-stack--800">
                <div className="vf-u-padding__top--400">
                    <div style={{display: "flex", alignItems: "baseline", gap: ".5rem"}}>
                        <h2 className="vf-text vf-text-heading--2">Search</h2>{" "}
                        <a
                            className="vf-link"
                            href="https://hmmer-web-docs.readthedocs.io/en/latest/algorithms.html#hmmer-algorithms"
                        >
                            documentation
                        </a>
                    </div>
                </div>
                <div className="vf-tabs">
                    <ul className="vf-tabs__list">
                        <li className="vf-tabs__item">
                            <a
                                role="tab"
                                // aria-selected={activeTab === tab.id}
                                // aria-controls={`${tab.id}-tab`}
                                onClick={() => navigate("/search/phmmer")}
                                className={`vf-tabs__link ${algo === "phmmer" ? "is-active" : ""}`}
                            >
                                phmmer
                            </a>
                        </li>
                        <li className="vf-tabs__item">
                            <a
                                role="tab"
                                // aria-selected={activeTab === tab.id}
                                // aria-controls={`${tab.id}-tab`}
                                onClick={() => navigate("/search/hmmscan")}
                                className={`vf-tabs__link ${algo === "hmmscan" ? "is-active" : ""}`}
                            >
                                hmmscan
                            </a>
                        </li>
                        <li className="vf-tabs__item">
                            <a
                                role="tab"
                                // aria-selected={activeTab === tab.id}
                                // aria-controls={`${tab.id}-tab`}
                                onClick={() => navigate("/search/hmmsearch")}
                                className={`vf-tabs__link ${algo === "hmmsearch" ? "is-active" : ""}`}
                            >
                                hmmsearch
                            </a>
                        </li>
                        <li className="vf-tabs__item">
                            <a
                                role="tab"
                                // aria-selected={activeTab === tab.id}
                                // aria-controls={`${tab.id}-tab`}
                                onClick={() => navigate("/search/jackhmmer")}
                                className={`vf-tabs__link ${algo === "jackhmmer" ? "is-active" : ""}`}
                            >
                                jackhmmer
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <Routes>
                <Route path="phmmer" element={<Form algo="phmmer" />} />
                <Route path="hmmscan" element={<Form algo="hmmscan" />} />
                <Route path="hmmsearch" element={<Form algo="hmmsearch" />} />
                <Route path="jackhmmer" element={<Form algo="jackhmmer" />} />
                <Route
                    path="*"
                    element={
                        <NotFound
                            title="Algorithm not supported"
                            lede="We’re sorry - the algorithm you're looking for is not supported."
                        />
                    }
                />
            </Routes>
        </>
    );
};

export default SearchPage;
