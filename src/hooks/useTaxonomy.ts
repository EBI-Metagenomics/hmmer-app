import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { taxonomyApiGetTaxonomyOptions } from "@/client/@tanstack/react-query.gen";

export const useTaxonomy = (id: string | number) => useQuery({
    ...taxonomyApiGetTaxonomyOptions({ path: { id: _.toInteger(id)}}),
});
