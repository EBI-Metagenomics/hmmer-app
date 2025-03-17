import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ToastContainer } from "react-toastify";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// @ts-ignore
import VfHero from "@visual-framework/vf-hero/vf-hero.react.js";

import { client } from "@/client/sdk.gen";
import { Hero } from "./components/molecules";
import Navigation from "./components/Navigation";
import Home from "./components/pages/home";
import SearchPage from "./components/pages/search";
import ResultsPage from "./components/pages/results";
import ResultsDetailsPage from "./components/pages/resultsDetails";

import "./App.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

function App() {
  return (
    <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister }}
  >
      <BrowserRouter>
        <div className="vf-body">
          {/* <VfHero
            vf_hero_kicker="EMBL-EBI"
            vf_hero_heading="HMMER"
            vf_hero_subheading="Biosequence analysis using profile hidden Markov Models"
            vf_hero_image={`url(${heroImageUrl})`}
            spacing={800}
          /> */}
          <Hero />
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search/*" element={<SearchPage />} />
            <Route path="/search" element={<Navigate to="phmmer" />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/results/:id/*" element={<ResultsDetailsPage />} />
            <Route path="/results/:id" element={<Navigate to="score" />} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </div>
      </BrowserRouter>
      <ToastContainer position="bottom-right"/>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export default App;
