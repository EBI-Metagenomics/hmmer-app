import {
  NodeRendererProps,
  Tree,
  RowRendererProps,
  NodeApi,
} from "react-arborist";
import { Suspense, useState } from "react";

import useTaxonomyTree from "../../../hooks/useTaxonomyTree";

import TreeToggleButton from "../../atoms/TreeToggleButton";
import Checkbox from "../../atoms/Checkbox";

import "./index.scss";

type NodeData = {
  id: number;
  data: {
    taxonomy_id: number;
    name: string;
    rank: string;
  };
  selected?: boolean;
  children: NodeData[];
};

const TaxonomyFilter: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading Taxonomy Tree...</div>}>
      <TaxonomyTree />
    </Suspense>
  );
};

const TaxonomyTree: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = useTaxonomyTree();

  const searchMatch = (node: NodeApi<NodeData>, searchTerm: string) => {
    return node.data.data.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="vf-stack vf-stack--200">
      <input
        type="text"
        className="vf-form__input vf-form__input--filter"
        placeholder="Search for specifix taxa"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Tree
        initialData={data}
        searchTerm={searchTerm}
        searchMatch={searchMatch}
        disableDrag
        disableMultiSelection={false}
        idAccessor={(d) => d.id.toString()}
        rowHeight={32}
        className="tree-container"
        width="80%"
        padding={8}
      >
        {Node}
      </Tree>
    </div>
  );
};

export function Row<NodeData>({
  attrs,
  innerRef,
  children,
}: RowRendererProps<NodeData>) {
  return (
    <div
      {...attrs}
      ref={innerRef}
      onFocus={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

const Node: React.FC<NodeRendererProps<NodeData>> = ({
  node,
  tree,
  style,
  dragHandle,
}) => {
  const allChildrenSelected =
    node.children?.every((child) => child.isSelected) ?? false;
  const someChildrenSelected =
    node.children?.some((child) => child.isSelected) ?? false;

  const [isSelected, setIsSelected] = useState(
    node.isSelected || allChildrenSelected,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    console.log("change", node.isSelected);
    if (node.isSelected) {
      tree.deselect(node.id);
    } else {
      tree.selectMulti(node.id);
    }

    setIsSelected(!isSelected);
  };

  return (
    <div ref={dragHandle} style={{ ...style, display: "flex" }}>
      {node.isInternal && (
        <TreeToggleButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            node.toggle();
          }}
          isOpen={node.isOpen}
        />
      )}

      <Checkbox
        checked={isSelected}
        indeterminate={someChildrenSelected && !allChildrenSelected}
        onChange={handleChange}
      />
      <span className="vf-u-type__text-body--2 vf-u-margin__left--200">
        {node.data.data.name}
      </span>
      <span className="vf-u-type__text-body--3 vf-u-margin__left--200">
        (taxid {node.data.data.taxonomy_id})
      </span>
      <span className="vf-u-text-color--grey vf-u-type__text-body--3  vf-u-margin__left--200">
        {node.data.data.rank}
      </span>
    </div>
  );
};

export default TaxonomyFilter;
