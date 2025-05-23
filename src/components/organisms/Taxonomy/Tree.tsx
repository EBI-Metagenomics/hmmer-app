import _ from "lodash";
import { useEffect, useRef } from "react";

import { TaxonomyTree as TaxonomyTreeType  } from "@/client";
// import "taxonomy-visualisation/dist/taxonomy-visualisation-ce.js";
// @ts-ignore
import TaxonomyVisualisation from 'taxonomy-visualisation';
interface TaxonomyTreeProps {
    tree: TaxonomyTreeType,
    onFocusChange: (e: FocusEvent) => void,
}

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({ tree, onFocusChange }) => {
    const treeRef = useRef<SVGSVGElement>(null);
    const focusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tree) {
            const visualization = new TaxonomyVisualisation(tree, {
                tree: treeRef.current,
                focus: focusRef.current,
                fisheye: true,
            })

            // @ts-ignore
            visualization.addEventListener("focus", onFocusChange);
            // @ts-ignore
            return () => visualization.removeEventListener("focus", onFocusChange);
        }
    }, [tree]);

    return (
        <div>
            <svg ref={treeRef} style={{ height: "20rem", width: "100%" }} />
            <div ref={focusRef} style={{ height: "5rem" }} />
        </div>
    );
};
