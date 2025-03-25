import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { VisibilityState } from "@tanstack/react-table";

interface Customization {
    columns: VisibilityState;
    pageSize: number;
}

interface CustomizationContextProps {
    columns: [VisibilityState, Dispatch<SetStateAction<VisibilityState>>];
    pageSize: [number, Dispatch<SetStateAction<number>>];
}

const CustomizationContext = createContext<CustomizationContextProps | undefined>(
    undefined,
);

interface CustomizationProviderProps {
    children: React.ReactNode;
}

export const CustomizationProvider: React.FC<CustomizationProviderProps> = ({ children }) => {
    const [customization, setCustomization] = useState<Customization>(() => {
        const storedCustomization = JSON.parse(localStorage.getItem("customization") ?? "{}");

        return {
            columns: {
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
            },
            pageSize: 50,
            ...storedCustomization,
        };
    });

    const [columns, setColumns] = useState<VisibilityState>(customization.columns);
    const [pageSize, setPageSize] = useState<number>(customization.pageSize);

    useEffect(() => {
        setCustomization({
            ...customization,
            columns,
        })
    }, [columns]);

    useEffect(() => {
        setCustomization({
            ...customization,
            pageSize,
        })
    }, [pageSize]);

    useEffect(() => {
        localStorage.setItem("customization", JSON.stringify(customization));
    }, [customization]);

    return <CustomizationContext.Provider value={{columns: [columns, setColumns], pageSize: [pageSize, setPageSize]}}>{children}</CustomizationContext.Provider>;
};

export const useColumns = () => {
    const context = useContext(CustomizationContext);

    if (!context) {
        throw new Error("useColumns must be used within a CustomizationProvider");
    }

    return context.columns;
};

export const usePageSize = () => {
    const context = useContext(CustomizationContext);

    if (!context) {
        throw new Error("usePageSize must be used within a CustomizationProvider");
    }

    return context.pageSize;
};

export const useCustomization = () => {
    const context = useContext(CustomizationContext);

    if (!context) {
        throw new Error("useCustomization must be used within a CustomizationProvider");
    }

    return context;
};
