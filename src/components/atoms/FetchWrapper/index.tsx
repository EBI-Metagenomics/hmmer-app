import { ProgressIndicator } from "@/components/atoms";

interface FetchWrapperProps {
    isPending: boolean;
    label?: string;
    children?: React.ReactNode;
}

export const FetchWrapper: React.FC<FetchWrapperProps> = ({ isPending, label, children }) => {
    if (isPending)
        return (
            <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
                <p className="vf-text-body vf-text-body--2">{label ?? "Fetching..."}</p>
                <ProgressIndicator />
            </div>
        );

    return children;
};
