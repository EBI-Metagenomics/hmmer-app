import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ProgressIndicator } from "@/components/atoms";
import { useTaxonomyTree } from "@/hooks/useTaxonomyTree";
import { pending, failed } from "@/utils/taskStates";
import { TaxonomyTree as Node } from "@/client";
import { TaxonomyTable } from "./Table";
import { TaxonomyTree } from "./Tree";

import "./index.scss";

interface TaxonomyElementProps {
    id: string;
}

export const TaxonomyElement: React.FC<TaxonomyElementProps> = ({ id }) => {
    const [focusedNode, setFocusedNode] = useState<Node>();

    const { data, isPending } = useTaxonomyTree(id);

    const speciesFromNode = (node?: Node) => {
        if (!node) return [];

        const rows: { taxonomy_id: number; species: string; count: number }[] = [];

        const traverse = (currentNode: Node) => {
            if (!currentNode.children || currentNode.children.length === 0) {
                rows.push({ taxonomy_id: currentNode.id, species: currentNode.name, count: currentNode.hitcount ?? 0 });
            } else {
                _.each(currentNode.children, traverse);
            }
        };

        traverse(node);

        return _.orderBy(rows, "count", "desc");
    };

    const onFocusChange = (e: CustomEvent) => {
        setFocusedNode(e.detail as unknown as Node);
    };

    useEffect(() => {
        if (data && data.tree && !focusedNode) {
            setFocusedNode(data.tree)
        }
    }, [data])

    const visibleRows = useMemo(() => speciesFromNode(focusedNode), [focusedNode]);

    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching taxonomy...</p>
                <ProgressIndicator />
            </div>
        );

    if (pending(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Taxonomy generation is still running...</p>
                <ProgressIndicator />
            </div>
        );

    if (failed(data))
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Taxonomy generation has failed!</p>
            </div>
        );

    return (
        <div className="vf-stack vf-stack--400">
            <TaxonomyTree tree={data?.tree!} onFocusChange={onFocusChange} />
            <TaxonomyTable id={id} rows={visibleRows} />
            <Link
                    to={{
                        pathname: `/results/${id}/score`,
                        search: !focusedNode || focusedNode.id === 1 ? "" : `?taxonomyIds=${focusedNode.id}`,
                    }}
                    className="vf-button vf-button--primary vf-button--sm vf-u-margin__top--400"
                >
                    Show scores for all displayed
                </Link>
        </div>
    );
};
