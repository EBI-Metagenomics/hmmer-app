import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";

import { HmmdSearchStats } from "@/client";

const StatsContext = createContext<
    [HmmdSearchStats | undefined, Dispatch<SetStateAction<HmmdSearchStats | undefined>>] | undefined
>(undefined);

interface StatsProviderProps {
    children: React.ReactNode;
}

export const StatsProvider: React.FC<StatsProviderProps> = ({ children }) => {
    const statsState = useState<HmmdSearchStats | undefined>();

    return <StatsContext.Provider value={statsState}>{children}</StatsContext.Provider>;
};

export const useStats = () => {
    const context = useContext(StatsContext);

    if (!context) {
        throw new Error("useStats must be used within a StatsProvider");
    }

    return context;
};