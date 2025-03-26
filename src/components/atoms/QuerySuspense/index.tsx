import { Suspense } from "react";
import { ProgressIndicator } from "../ProgressIndicator";

interface QuerySuspenseProps {
    children: React.ReactNode;
    id?: React.Key;
}

export const QuerySuspense: React.FC<QuerySuspenseProps> = ({ children, id }) => {
    console.log("susepse");
    return <Suspense key={id} fallback={<Fallback />}>{children}</Suspense>;
};

const Fallback: React.FC = () => {
    console.log("fallback");
    return (
        <div className="vf-stack vf-stack--400 | vf-u-padding__top--400">
            <p className="vf-text-body vf-text-body--2">Fetching...</p>
            <ProgressIndicator />
        </div>
    );
};
