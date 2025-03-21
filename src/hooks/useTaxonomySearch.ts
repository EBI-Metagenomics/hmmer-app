import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { taxonomyApiSearchTaxonomyOptions } from "@/client/@tanstack/react-query.gen";

export const useTaxonomySearch = (input: string | number) => useQuery({
    ...taxonomyApiSearchTaxonomyOptions({ query: { q: _.toString(input)}}),
});
