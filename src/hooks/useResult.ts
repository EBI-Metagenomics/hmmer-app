import { useQuery } from "@tanstack/react-query";
import { resultApiGetResultOptions } from "@/client/@tanstack/react-query.gen";

export const useResult = (
    id: string,
    page: number = 1,
    pageSize: number = 50,
    withDomains: boolean = false,
    taxonomyIds?: number[],
    architecture?: string,
) =>
    useQuery({
        ...resultApiGetResultOptions({
            path: { id: id! },
            query: { page, page_size: pageSize, taxonomy_ids: taxonomyIds, with_domains: withDomains, architecture },
        }),
        refetchInterval(query) {
            if (!query.state.data && query.state.errorUpdateCount > 0) return false;
            if (query.state.data?.status === "SUCCESS") return false;
            if (query.state.data?.status === "FAILURE") return false;

            return Math.min(1000 * 2 ** query.state.dataUpdateCount, 5 * 60 * 1000);
        },
        refetchIntervalInBackground: true,
    });
