import _ from "lodash";
import { useEffect, useRef } from "react";

import { TaxonomyTree as TaxonomyTreeType } from "@/client";

// @ts-ignore
import TaxonomyVisualisation from "taxonomy-visualisation";
interface TaxonomyTreeProps {
    tree: TaxonomyTreeType;
    onFocusChange: (e: CustomEvent) => void;
}

export const TaxonomyTree: React.FC<TaxonomyTreeProps> = ({ tree, onFocusChange }) => {
    const visualizationRef = useRef<TaxonomyVisualisation>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const treeRef = useRef<SVGSVGElement>(null);
    const focusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!treeRef.current || !focusRef.current) return;

        const onClick = (e: CustomEvent) => {
            const node = visualizationRef.current.getDataFromEvent(e);

            if (!node) return;

            visualizationRef.current.focusNodeWithID(node.id);
            visualizationRef.current.redraw();
        };

        if (!visualizationRef.current) {
            visualizationRef.current = new TaxonomyVisualisation(tree, {
                initialMaxNodes: 10,
                fisheye: true,
                enableZooming: true,
                useCtrlToZoom: true,
            });

            visualizationRef.current.tree = treeRef.current;
            visualizationRef.current.focus = focusRef.current;

            // @ts-ignore
            visualizationRef.current.addEventListener("focus", onFocusChange);
            visualizationRef.current.focus.addEventListener("click", onClick);

            if (buttonRef.current) {
                buttonRef.current.addEventListener("click", () => visualizationRef.current.resetZoom());
            }
        }
    }, [tree, onFocusChange]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="vf-button vf-button--secondary vf-button--sm" ref={buttonRef}>
                    Reset zoom
                </button>
            </div>
            <svg ref={treeRef} style={{ height: "25rem", width: "100%", border: "3px solid #54585a" }} />
            <p className="vf-form__helper">Use Ctrl + Scroll to zoom, drag to move around.</p>
            <div ref={focusRef} style={{ height: "5rem" }} />
        </div>
    );
};
