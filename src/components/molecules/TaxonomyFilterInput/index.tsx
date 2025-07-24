import _ from "lodash";
import { useFormContext } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { taxonomyApiSearchTaxonomyOptions } from "@/client/@tanstack/react-query.gen";
import { TaxonomyResponseSchema } from "@/client";
import { Typeahead } from "../Typeahead";

import "./index.scss";

export const TaxonomyFilterInput: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTaxonomies, setSelectedTaxonomies] = useState<TaxonomyResponseSchema[]>([]);

    const { register, setValue, watch } = useFormContext();

    const database = watch("database");

    const { data } = useQuery({
        ...taxonomyApiSearchTaxonomyOptions({ query: { q: searchTerm, database } }),
        enabled: Boolean(searchTerm),
    });

    const onValueSelected = (taxonomy: TaxonomyResponseSchema) => {
        const existingTaxonomy = _.find(selectedTaxonomies, ["id", taxonomy.id]);

        if (existingTaxonomy) return;

        setSelectedTaxonomies([...selectedTaxonomies, taxonomy]);
    };

    const onRemove = (taxonomy: TaxonomyResponseSchema) => {
        setSelectedTaxonomies(_.reject(selectedTaxonomies, ["id", taxonomy.id]));
    };

    useEffect(() => {
        setValue("taxonomy_ids", _.map(selectedTaxonomies, "id"));
    }, [selectedTaxonomies]);

    useEffect(() => {
        setSelectedTaxonomies([]);
    }, [database]);

    return (
        <div className="vf-stack vf-stack--400">
            <input type="hidden" {...register("taxonomy_ids")} />
            <div>
                <Typeahead<TaxonomyResponseSchema>
                    data={data}
                    onTextChange={(text) => setSearchTerm(text)}
                    onValueSelected={onValueSelected}
                    renderItem={(item) => (
                        <div className="chip-text">
                            <div className="chip-title">{item.name}</div>
                            <div className="chip-subtitle">
                                {item.rank} <i>({item.id})</i>
                            </div>
                        </div>
                    )}
                />
                <p className="vf-form__helper">Showing only taxa available in the selected database</p>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {selectedTaxonomies.map((taxonomy) => (
                    <TaxonomyChip key={taxonomy.id} taxonomy={taxonomy} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
};

interface TaxonomyChipProps {
    taxonomy: TaxonomyResponseSchema;
    onRemove: (value: TaxonomyResponseSchema) => void;
}

const TaxonomyChip: React.FC<TaxonomyChipProps> = ({ taxonomy, onRemove }) => {
    return (
        <div className="chip">
            <div className="chip-text">
                <div className="chip-title">{taxonomy.name}</div>
                <div className="chip-subtitle">
                    {taxonomy.rank} <i>({taxonomy.id})</i>
                </div>
            </div>
            <button
                className="chip-close"
                onClick={(e) => {
                    e.preventDefault();
                    onRemove(taxonomy);
                }}
            >
                &times;
            </button>
            {/* <RemoveButton
                onClick={(e) => {
                    e.preventDefault();
                    onRemove(taxonomy);
                }}
            /> */}
        </div>
    );
};
// const localClient = createClient({
//   baseUrl: import.meta.env.VITE_API_URL,
// });

// const TaxonomyTree: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState("");

//   const { data } = useQuery({
//     ...taxonomyApiGetOptions({
//       client: localClient,
//     }),
//   });

//   const searchMatch = (node: NodeApi<NodeData>, searchTerm: string) => {
//     return node.data.name.toLowerCase().includes(searchTerm.toLowerCase());
//   };

//   return (
//     <div className="vf-stack vf-stack--400">
//       <input
//         type="text"
//         className="vf-form__input vf-form__input--filter"
//         placeholder="Search for specifix taxa"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//       <Tree
//         // @ts-ignore
//         initialData={data[0].children}
//         searchTerm={searchTerm}
//         searchMatch={searchMatch}
//         disableDrag
//         disableMultiSelection={false}
//         openByDefault={false}
//         idAccessor={(d) => d.taxonomy_id.toString()}
//         rowHeight={30}
//         className="tree"
//         rowClassName="tree--row"
//         width="100%"
//         height={200}
//         padding={8}
//       >
//         {Node}
//       </Tree>
//     </div>
//   );
// };
