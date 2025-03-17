import { useQuery } from "@tanstack/react-query";
import { taxonomyApiGetTaxonomyTreeOptions } from "@/client/@tanstack/react-query.gen";

export const useTaxonomyTree = (id: string) => useQuery({
    ...taxonomyApiGetTaxonomyTreeOptions({ path: { id: id! }}),
    refetchInterval(query) {
        if (query.state.data?.status === "SUCCESS") return false;
        if (query.state.data?.status === "FAILURE") return false;

        return Math.min(1000 * (2 ** query.state.dataUpdateCount), 5 * 60 * 1000);
    },
    refetchIntervalInBackground: true,
    staleTime: Infinity,
});
