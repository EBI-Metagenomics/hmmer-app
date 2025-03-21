import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { VisibilityState } from "@tanstack/react-table";

const ColumnsContext = createContext<[VisibilityState, Dispatch<SetStateAction<VisibilityState>>] | undefined>(
    undefined,
);

interface ColumnsProviderProps {
    children: React.ReactNode;
}

export const ColumnsProvider: React.FC<ColumnsProviderProps> = ({ children }) => {
    const [columns, setColumns] = useState<VisibilityState>(() => {
        const storedColumnVisibility = JSON.parse(localStorage.getItem("columnVisibility") ?? "{}");

        return {
            rowNumber: false,
            identifier: false,
            kingdom: false,
            phylum: false,
            structures: false,
            hitPositions: false,
            numHits: false,
            numSignificantHits: false,
            bitscore: false,
            alignmentStart: false,
            alignmentEnd: false,
            modelStart: false,
            modelEnd: false,
            modelLength: false,
            ...storedColumnVisibility,
        };
    });

    useEffect(() => {
        localStorage.setItem("columnVisibility", JSON.stringify(columns));
    }, [columns]);

    return <ColumnsContext.Provider value={[columns, setColumns]}>{children}</ColumnsContext.Provider>;
};

export const useColumns = () => {
    const context = useContext(ColumnsContext);

    if (!context) {
        throw new Error("useColumns must be used within a ColumnsProvider");
    }

    return context;
};
