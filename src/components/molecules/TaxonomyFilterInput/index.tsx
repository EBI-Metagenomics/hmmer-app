import _ from "lodash";
import { NodeRendererProps, Tree, NodeApi } from "react-arborist";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/client/client";

import { taxonomyApiGetOptions } from "@/client/@tanstack/react-query.gen";

import { Checkbox, TreeToggleButton } from "@components/atoms";

import "./index.scss";

type NodeData = {
  taxonomy_id: number;
  name: string;
  rank: string;
  children: NodeData[];
};

export const TaxonomyFilterInput: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading Taxonomy Tree...</div>}>
      <TaxonomyTree />
    </Suspense>
  );
};

const localClient = createClient({
  baseUrl: import.meta.env.VITE_API_URL,
});

const TaxonomyTree: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data } = useQuery({
    ...taxonomyApiGetOptions({
      client: localClient,
    }),
  });

  const searchMatch = (node: NodeApi<NodeData>, searchTerm: string) => {
    return node.data.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="vf-stack vf-stack--400">
      <input
        type="text"
        className="vf-form__input vf-form__input--filter"
        placeholder="Search for specifix taxa"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Tree
        // @ts-ignore
        initialData={data[0].children}
        searchTerm={searchTerm}
        searchMatch={searchMatch}
        disableDrag
        disableMultiSelection={false}
        openByDefault={false}
        idAccessor={(d) => d.taxonomy_id.toString()}
        rowHeight={30}
        className="tree"
        rowClassName="tree--row"
        width="100%"
        height={200}
        padding={8}
      >
        {Node}
      </Tree>
    </div>
  );
};

const Node: React.FC<NodeRendererProps<NodeData>> = ({
  node,
  tree,
  style,
  dragHandle,
}) => {
  const onlySomeChildrenSelected =
    _.some(node.children, "isSelected") &&
    !_.every(node.children, "isSelected");

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (node.isSelected) {
      tree.deselect(node.id);
    } else {
      tree.selectMulti(node.id);
    }

    if (node.parent) {
      const parent = node.parent;
      const allChildrenSelected = _.every(parent.children, "isSelected");

      if (allChildrenSelected) {
        parent.selectMulti();
      } else {
        parent.deselect();
      }
    }
  };

  return (
    <div
      ref={dragHandle}
      onClick={handleClick}
      style={{ ...style, display: "flex" }}
    >
      {node.isInternal ? (
        <TreeToggleButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            node.toggle();
          }}
          isOpen={node.isOpen}
        />
      ) : (
        <div style={{ width: "1.5rem" }} />
      )}

      <Checkbox
        checked={node.isSelected || node.parent?.isSelected}
        indeterminate={onlySomeChildrenSelected}
        onClick={(e: React.MouseEvent<HTMLInputElement>) => e.preventDefault()}
        readOnly
      />
      <span className="vf-u-type__text-body--2 vf-u-margin__left--200">
        {node.data.name}
      </span>
      {/* <span className="vf-u-type__text-body--3 vf-u-margin__left--200">
        (taxid {node.data.taxonomy_id})
      </span> */}
      <span className="vf-u-text-color--grey vf-u-type__text-body--3  vf-u-margin__left--200">
        {node.data.rank}
      </span>
    </div>
  );
};
