import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ToastContainer } from "react-toastify";
import ReactModal from "react-modal";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { client } from "@/client/sdk.gen";
import { Hero, EBIFooter } from "./components/molecules";
import Navigation from "./components/Navigation";
import Home from "./components/pages/home";
import SearchPage from "./components/pages/search";
import ResultsPage from "./components/pages/results";
import ResultsDetailsPage from "./components/pages/resultsDetails";
import { CustomizationProvider, StatsProvider } from "./context";

import "@visual-framework/ebi-header-footer/ebi-header-footer--header.precompiled.js";
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
});

ReactModal.setAppElement("#root");

function App() {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <CustomizationProvider>
                <StatsProvider>
                    <div className="vf-body vf-stack vf-stack--200">
                        <BrowserRouter basename={import.meta.env.BASE_URL}>
                            <Hero />

                            <Routes>
                                <Route path="/home" element={<></>} />
                                <Route path="*" element={<Navigation />} />
                            </Routes>

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
                        </BrowserRouter>
                    </div>
                    <EBIFooter />
                    <ToastContainer position="bottom-right" />
                    <ReactQueryDevtools initialIsOpen={false} />
                </StatsProvider>
            </CustomizationProvider>
        </PersistQueryClientProvider>
    );
}

export default App;
