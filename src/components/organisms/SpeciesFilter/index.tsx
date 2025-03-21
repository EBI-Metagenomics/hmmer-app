import _ from "lodash";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery, useQueries } from "@tanstack/react-query";
import Highlighter, { FindChunks, Chunk } from "react-highlight-words";

import { TaxonomyResponseSchema } from "@/client/types.gen";
import { taxonomyApiGetTaxonomyOptions, taxonomyApiSearchTaxonomyOptions } from "@/client/@tanstack/react-query.gen";
import { RemoveButton } from "@/components/atoms";
import { Typeahead } from "@/components/molecules";

import "./index.scss";

export const SpeciesFilter: React.FC = () => {
    const [query, setQuery] = useState<string>("");
    const [taxonomyOptions, setTaxonomyOptions] = useState<TaxonomyResponseSchema[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    const { data } = useQuery({
        ...taxonomyApiSearchTaxonomyOptions({ query: { q: _.toString(query) } }),
        enabled: query !== "",
    });

    const taxonomies = useQueries({
        queries: _.map(searchParams.getAll("taxonomyIds"), (taxonomyId) => ({
            ...taxonomyApiGetTaxonomyOptions({ path: { id: _.toInteger(taxonomyId) } }),
            staleTime: Infinity,
        })),
    });

    useEffect(() => {
        setTaxonomyOptions(data ?? []);
    }, [data]);

    const renderItem = (item: TaxonomyResponseSchema) => {
        const words = query.split(" ");

        const findChunksAtBeginningOfWords = ({ searchWords, textToHighlight }: FindChunks) => {
            const chunks: Chunk[] = [];
            const textLow = textToHighlight.toLowerCase();
            // Match at the beginning of each new word
            // New word start after whitespace or - (hyphen)
            const sep = /[-\s]+/;

            // Match at the beginning of each new word
            // New word start after whitespace or - (hyphen)
            const singleTextWords = textLow.split(sep);

            // It could be possible that there are multiple spaces between words
            // Hence we store the index (position) of each single word with textToHighlight
            let fromIndex = 0;
            const singleTextWordsWithPos = singleTextWords.map((s) => {
                const indexInWord = textLow.indexOf(s, fromIndex);
                fromIndex = indexInWord;
                return {
                    word: s,
                    index: indexInWord,
                };
            });

            // Add chunks for every searchWord
            searchWords.forEach((sw) => {
                const swLow = (sw as string).toLowerCase();
                // Do it for every single text word
                singleTextWordsWithPos.forEach((s) => {
                    if (s.word.startsWith(swLow)) {
                        const start = s.index;
                        const end = s.index + swLow.length;
                        chunks.push({
                            start,
                            end,
                        });
                    }
                });

                // The complete word including whitespace should also be handled, e.g.
                // searchWord='Angela Mer' should be highlighted in 'Angela Merkel'
                if (textLow.startsWith(swLow)) {
                    const start = 0;
                    const end = swLow.length;
                    chunks.push({
                        start,
                        end,
                    });
                }
            });

            return chunks;
        };

        return (
            <Highlighter
                searchWords={words}
                findChunks={findChunksAtBeginningOfWords}
                textToHighlight={item.name}
                highlightTag="b"
            />
        );
    };

    return (
        <fieldset className="vf-form__fieldset vf-stack vf-stack--200">
            <legend className="vf-form__legend">Species</legend>
            <Typeahead<TaxonomyResponseSchema>
                data={taxonomyOptions}
                placeholder="Species name or tax id"
                renderItem={renderItem}
                onTextChange={(text) => {
                    if (!text) setTaxonomyOptions([]);
                    if (text.length >= 3) setQuery(text);
                }}
                onValueSelected={(value) =>
                    setSearchParams((prevSearchParams) => {
                        if (!prevSearchParams.has("taxonomyIds", _.toString(value.taxonomy_id))) {
                            prevSearchParams.append("taxonomyIds", _.toString(value.taxonomy_id));
                        }

                        return prevSearchParams;
                    })
                }
            />
            <div className="vf-stack vf-stack--200 vf-u-padding__left--100 vf-u-padding__right--100">
                {_.map(taxonomies, (taxonomy, index) => (
                    <div className="taxonomy-item" key={index}>
                        <span className="vf-badge vf-badge--primary">{taxonomy.data?.name}</span>
                        <RemoveButton
                            onClick={(e) => {
                                e.preventDefault();
                                setSearchParams((prevSearchParams) => {
                                    prevSearchParams.delete("taxonomyIds", _.toString(taxonomy.data?.taxonomy_id));
                                    return prevSearchParams;
                                });
                            }}
                        />
                    </div>
                ))}
            </div>
        </fieldset>
    );
};
