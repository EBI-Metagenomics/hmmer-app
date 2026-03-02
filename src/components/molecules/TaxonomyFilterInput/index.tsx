import { TaxonomyResponseSchema } from "@/client";
import { taxonomyApiSearchTaxonomyOptions } from "@/client/@tanstack/react-query.gen";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import ReactModal from "react-modal";
import { Typeahead } from "../Typeahead";

import "./index.scss";

type TaxonomySelection = TaxonomyResponseSchema & {
    exclusionList: TaxonomyResponseSchema[];
};

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        borderRadius: 0,
        borderWidth: 2,
    },
    overlay: {
        zIndex: 99999,
    },
};

export const TaxonomyFilterInput: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTaxa, setSelectedTaxa] = useState<TaxonomySelection[]>([]);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showIncludeAllConfirm, setShowIncludeAllConfirm] = useState(false);
    const [filteredSearchResults, setFilteredSearchResults] = useState<TaxonomyResponseSchema[]>([]);

    const { register, setValue, watch } = useFormContext();

    const database = watch("database");

    const { data } = useQuery({
        ...taxonomyApiSearchTaxonomyOptions({ query: { q: searchTerm, database } }),
        enabled: Boolean(searchTerm),
    });

    const onSelect = (taxonomy: TaxonomyResponseSchema) => {
        const newSelectedTaxa = [...selectedTaxa];

        const existingAncestor = _.find(
            newSelectedTaxa,
            (item) => item.lft <= taxonomy.lft && item.rgt >= taxonomy.lft,
        );

        if (!existingAncestor) {
            const includedDescendantIndex = _.findLastIndex(
                newSelectedTaxa,
                (item) => item.lft >= taxonomy.lft && item.rgt <= taxonomy.rgt,
            );

            let exclusionList: TaxonomyResponseSchema[] = [];

            if (includedDescendantIndex > -1) {
                exclusionList = newSelectedTaxa[includedDescendantIndex].exclusionList;
                _.pullAt(newSelectedTaxa, includedDescendantIndex);
            }

            newSelectedTaxa.push({ ...taxonomy, exclusionList });
        } else {
            existingAncestor.exclusionList = _.reject(
                existingAncestor.exclusionList,
                (item) => item.lft >= taxonomy.lft && item.rgt <= taxonomy.rgt,
            );
            existingAncestor.exclusionList.push(taxonomy);
        }

        setSelectedTaxa(newSelectedTaxa);
    };

    const onRemove = (taxonomy: TaxonomyResponseSchema, parent?: TaxonomyResponseSchema) => {
        let newSelectedTaxa = [...selectedTaxa];

        if (!parent) {
            newSelectedTaxa = _.reject(newSelectedTaxa, ["id", taxonomy.id]);
        } else {
            const parentToRemoveFrom = _.find(newSelectedTaxa, ["id", parent.id]);
            if (parentToRemoveFrom) {
                parentToRemoveFrom.exclusionList = _.reject(parentToRemoveFrom.exclusionList, ["id", taxonomy.id]);
            }
        }

        setSelectedTaxa(newSelectedTaxa);
    };

    const includeAllTaxa = () => {
        setSelectedTaxa([
            {
                id: 1,
                name: "All taxa",
                rank: "root",
                depth: 0,
                lft: 1,
                rgt: Infinity,
                exclusionList: [],
            },
        ]);
    };

    useEffect(() => {
        setValue("include_taxonomy", _.map(selectedTaxa, "id"));
        setValue("exclude_taxonomy", _(selectedTaxa).flatMap("exclusionList").map("id").value());
    }, [selectedTaxa]);

    useEffect(() => {
        setSelectedTaxa([]);
    }, [database]);

    useEffect(() => {
        const idsToExclude = _(selectedTaxa)
            .flatMap("exclusionList")
            .map("id")
            .concat(_.map(selectedTaxa, "id"))
            .value();

        setFilteredSearchResults(_.differenceWith(data, idsToExclude, (tax, id) => tax.id === id));
    }, [data]);

    return (
        <div className="vf-stack vf-stack--400">
            <input type="hidden" {...register("taxonomy_ids")} />
            <div className="vf-u-margin__top--0">
                <div style={{ display: "flex", gap: "0.25rem" }}>
                    <Typeahead<TaxonomyResponseSchema>
                        data={filteredSearchResults}
                        onTextChange={(text) => setSearchTerm(text)}
                        onValueSelected={onSelect}
                        renderItem={(item) => (
                            <div className="search-result-text">
                                <div className="search-result-title">{item.name}</div>
                                <div className="search-result-subtitle">
                                    {item.rank} <i>({item.id})</i>
                                </div>
                            </div>
                        )}
                    />
                    <button
                        className="vf-button vf-button--secondary vf-button--sm"
                        type="reset"
                        disabled={Boolean(_.find(selectedTaxa, ["id", 1]))}
                        onClick={(e) => {
                            e.preventDefault();
                            if (selectedTaxa.length > 0) {
                                setShowIncludeAllConfirm(true);
                            } else {
                                includeAllTaxa();
                            }
                        }}
                    >
                        Include all taxa
                    </button>
                    <button
                        className="vf-button vf-button--tertiary vf-button--sm"
                        type="reset"
                        disabled={selectedTaxa.length === 0}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowClearConfirm(true);
                        }}
                    >
                        Clear all
                    </button>
                </div>
                <p className="vf-form__helper">Showing only taxa available in the selected database</p>
            </div>

            {selectedTaxa.length > 0 && (
                <div className="vf-card">
                    <div className="vf-stack vf-stack--200 vf-text-body--2 | vf-card__content | vf-u-padding__bottom--0">
                        {selectedTaxa.map((taxonomy) => (
                            <div key={taxonomy.id} className="vf-stack vf-stack--200">
                                <div className="tax-row">
                                    <div>
                                        <b>{taxonomy.name}</b> {taxonomy.rank} ({taxonomy.id}){" "}
                                    </div>
                                    <div>
                                        <button
                                            className="tax-row-close"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onRemove(taxonomy);
                                            }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {taxonomy.exclusionList.map((excludedTaxonomy) => (
                                    <div key={excludedTaxonomy.id} className="tax-row vf-u-margin__left--800">
                                        <div>
                                            But not: <b>{excludedTaxonomy.name}</b> {excludedTaxonomy.rank} (
                                            {excludedTaxonomy.id}){" "}
                                        </div>
                                        <div>
                                            <button
                                                className="tax-row-close"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onRemove(excludedTaxonomy, taxonomy);
                                                }}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showClearConfirm && (
                <ReactModal
                    style={customStyles}
                    contentLabel="Customization"
                    isOpen={showClearConfirm}
                    onRequestClose={() => setShowClearConfirm(false)}
                >
                    <div className="vf-stack vf-stack--800">
                        <div>
                            <p className="warning-text vf-text-body vf-text-body--2">
                                Warning: this will clear all your previously selected taxa.
                            </p>
                        </div>
                        <div className="button-container">
                            <button
                                className="vf-button vf-button--primary vf-button--sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTaxa([]);
                                    setShowClearConfirm(false);
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                className="vf-button vf-button--secondary vf-button--sm"
                                onClick={() => setShowClearConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ReactModal>
            )}

            {showIncludeAllConfirm && (
                <ReactModal
                    style={customStyles}
                    contentLabel="Customization"
                    isOpen={showIncludeAllConfirm}
                    onRequestClose={() => setShowIncludeAllConfirm(false)}
                >
                    <div className="vf-stack vf-stack--800">
                        <div>
                            <p className="warning-text vf-text-body vf-text-body--2">
                                Warning: this will clear all your previously selected taxa.
                            </p>
                        </div>
                        <div className="button-container">
                            <button
                                className="vf-button vf-button--primary vf-button--sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    includeAllTaxa();
                                    setShowIncludeAllConfirm(false);
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                className="vf-button vf-button--secondary vf-button--sm"
                                onClick={() => setShowIncludeAllConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </ReactModal>
            )}
        </div>
    );
};
