import { useMutation } from "@tanstack/react-query";
import { Route, Routes, useNavigate, useMatch } from "react-router";
import { phmmerApiSearchMutation } from "@/client/@tanstack/react-query.gen";

import { Form } from "@components/organisms";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const route = useMatch(`/search/:algo`);
  const algo = route?.params.algo;

  return (
    <>
    <div className="vf-stack vf-stack--400">
    <h2 className="vf-text vf-text-heading--2">Search</h2>
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
        </ul>
    </div>
    </div>
    <Routes>
      <Route path="phmmer" element={<PhmmerForm />} />
      <Route path="hmmscan" element="hmmscan content" />
      <Route path="hmmsearch" element="hmmsearch content" />
    </Routes>
  </>
  );
};

const PhmmerForm: React.FC = () => {
  const navigate = useNavigate();

  const submitSearch = useMutation({
    ...phmmerApiSearchMutation(),
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      navigate(`/results/${data.id}`);
    },
  });

  return (
    <div className="vf-stack vf-stack--1200 | vf-u-padding__top--400">
      <h3 className="vf-text vf-text-heading--3 vf-u-text-color--grey">protein sequence vs protein sequence database</h3>
      <Form onSubmit={(data) => submitSearch.mutateAsync({ body: data })} />
    </div>
  );
}

export default SearchPage;
