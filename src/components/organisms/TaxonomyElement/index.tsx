import _ from "lodash";
import { useState } from "react";

import { ProgressIndicator } from "@/components/atoms";
import { TaxonomyTable, TaxonomyTree } from "@components/organisms";
import { useTaxonomyTree } from "@/hooks/useTaxonomyTree";

interface Node {
    id: number;
    name: string;
    children?: Node[];
    hitdist?: number[];
    hitcount?: number;
}

interface TaxonomyElementProps {
    id: string;
}

export const TaxonomyElement: React.FC<TaxonomyElementProps> = ({ id }) => {
    const [visibleIds, setVisibleIds] = useState<number[]>([]);

    const { data, isPending } = useTaxonomyTree(id)

    const getSpeciesIds = (node: Node) => {
        const leafNodeIds: number[] = [];

        const traverse = (currentNode: Node) => {
            if (!currentNode.children || currentNode.children.length === 0) {
                leafNodeIds.push(currentNode.id);
            } else {
                _.each(currentNode.children, traverse);
            }
        };

        traverse(node);
        return leafNodeIds;
    };

    const onFocusChange = (e: FocusEvent) => {
        const ids = getSpeciesIds(e.detail as unknown as Node);
        setVisibleIds(ids);
    };

    if (isPending || data?.status !== "SUCCESS") {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Fetching taxonomy...</p>
                <ProgressIndicator />
            </div>
        );
    }
    return (
        <div className="vf-stack vf-stack--400">
            <TaxonomyTree tree={data?.tree!} onFocusChange={onFocusChange}/>
            <TaxonomyTable id={id} visibleIds={visibleIds} />
        </div>
    );
};
