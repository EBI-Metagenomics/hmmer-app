import { useEffect, useState, useRef, HTMLAttributes } from "react";
import {
  Route,
  Routes,
  useParams,
  useNavigate,
  useResolvedPath,
  useMatch,
} from "react-router";
import { useQuery } from "@tanstack/react-query";
// @ts-ignore
import VfTabs from "@visual-framework/vf-tabs/vf-tabs.react.js";
// @ts-ignore
import "taxonomy-visualisation/dist/taxonomy-visualisation-ce.js";

import { searchApiStatusOptions } from "@/client/@tanstack/react-query.gen";
import { ResultTable } from "@components/organisms";
import rootNode from "@/assets/1.json";
import { Dictionary } from "lodash";
import { H } from "node_modules/react-router/dist/production/route-data-DuV3tXo2.d.mts";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const route = useMatch(`/results/:id/:tab`);
  const matchedPath = route?.params.tab;
  const id = route?.params.id;

  const [jobStatus, setJobStatus] = useState<string>("PENDING");

  const { data: jobStatusData } = useQuery({
    ...searchApiStatusOptions({ path: { id: id! } }),
    refetchInterval(query) {
      if (query.state.data?.status === "SUCCESS") return false;
      if (query.state.data?.status === "FAILURE") return false;

      return 1000;
    },
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (jobStatusData) {
      setJobStatus(jobStatusData.status);
    }
  }, [jobStatusData]);

  if (jobStatus === "SUCCESS") return (
    <div className="vf-stack vf-stack--400">
      <h2 className="vf-text vf-text-heading--2">Browse Results</h2>
      <div className="vf-tabs">
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
        </ul>
      </div>
      <Routes>
        <Route path="score" element={<ResultTable id={id!} />} />
        <Route path="taxonomy" element={<TaxonomyElement />} />
        <Route path="domain" element="Domain content" />
      </Routes>
    </div>
  );
  
  if (jobStatus === "FAILURE") return (<div>Your job failed</div>)

  return (<div>Your job is still running...</div>)
};

const TaxonomyElement = () => {
  const visualizationRef = useRef(null);
  const [tree, setTree] = useState(rootNode);

  useEffect(() => {
    const visualization = visualizationRef.current;

    if (visualization) {
      visualization.data = tree;
    }
  }, [tree]);

  return (
    <div style={{ height: "500px" }}>
      <div id="focus-root"></div>
      <taxonomy-visualisation
        ref={visualizationRef}
        id="tree-root"
        focus-id="focus-root"
        ></taxonomy-visualisation>
    </div>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "taxonomy-visualisation": TaxonomyVisualisationAttributes;
    }

    interface TaxonomyVisualisationAttributes extends React.DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
      data?: string;
    }
  }
}

export default ResultsPage;
