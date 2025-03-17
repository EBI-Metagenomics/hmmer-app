import { ProgressIndicator } from "@/components/atoms";

interface JobStatusProps {
    status: string,
    id: string,
};

export const JobStatus: React.FC<JobStatusProps> = ({ status, id }) => {
    if (status !== "SUCCESS" && status !== "FAILURE") {
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">Your job <b>{id}</b> is still running...</p>
                <ProgressIndicator />
            </div>
        )
    }
};
