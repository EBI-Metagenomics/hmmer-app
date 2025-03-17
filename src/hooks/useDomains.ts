import { useQuery } from "@tanstack/react-query";
import { resultApiGetDomainsOptions } from "@/client/@tanstack/react-query.gen";

export const useDomains = (id: string, index: number) => useQuery({
    ...resultApiGetDomainsOptions({ path: { id: id! }, query: { index } }),
    refetchInterval(query) {
        if (query.state.data?.status === "SUCCESS") return false;
        if (query.state.data?.status === "FAILURE") return false;

        return Math.min(1000 * (2 ** query.state.dataUpdateCount), 5 * 60 * 1000);
    },
    refetchIntervalInBackground: true,
});
