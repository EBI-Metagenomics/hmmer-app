import { useEffect, useRef } from "react";

import { TaxonomyTree as TaxonomyTreeType  } from "@/client";
import "taxonomy-visualisation/dist/taxonomy-visualisation-ce.js";
import "./index.scss";

interface TaxonomyTreeProps {
    tree: TaxonomyTreeType,
    onFocusChange: (e: FocusEvent) => void,
}

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({ tree, onFocusChange }) => {
    const visualizationRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const visualization = visualizationRef.current;

        if (visualization) {
            // @ts-ignore
            visualization.data = tree;
        }
    }, [tree]);

    useEffect(() => {
        // @ts-ignore
        visualizationRef.current?._visualisation.addEventListener("focus", onFocusChange);
        // @ts-ignore
        return () => visualizationRef.current?._visualisation.removeEventListener("focus", onFocusChange);
    }, []);

    return (
        <div>
            <div style={{ height: "20rem" }}>
                {/* @ts-ignore */}
                <taxonomy-visualisation
                    ref={visualizationRef}
                    focus-id="focus-root"
                    initial-max-nodes="4"
                />
            </div>
            <div id="focus-root" style={{ height: "5rem" }} />
        </div>
    );
};
