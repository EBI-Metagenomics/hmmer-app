import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

interface JackhmmerChanges {
    include: number[];
    exclude: number[];
    excludeAll: boolean;
}

const JackhmmerContext = createContext<[JackhmmerChanges, Dispatch<SetStateAction<JackhmmerChanges>>] | undefined>(
    undefined,
);

interface JackhmmerProviderProps {
    children: React.ReactNode;
}

export const JackhmmerProvider: React.FC<JackhmmerProviderProps> = ({ children }) => {
    const jackhmmerState = useState<JackhmmerChanges>({ include: [], exclude: [], excludeAll: false });

    return <JackhmmerContext.Provider value={jackhmmerState}>{children}</JackhmmerContext.Provider>;
};

export const useJackhmmer = () => {
    const context = useContext(JackhmmerContext);

    if (!context) {
        throw new Error("useJackhmmer must be used within a JackhmmerProvider");
    }

    return context;
};
