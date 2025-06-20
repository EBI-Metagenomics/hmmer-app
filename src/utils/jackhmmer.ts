import { HmmdSearchStats } from "@/client";

export const jobConverged = (stats?: HmmdSearchStats) => {
    return !stats || (stats.ngained === 0 && stats.ndropped === 0 && stats.nlost === 0);
};
