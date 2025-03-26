import { ErrorBoundary, FallbackProps } from "react-error-boundary";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export const QueryErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
    return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
};

const Fallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div role="alert">
            <p>
                Something went wrong. Please{" "}
                <button className="vf-button vf-button--link" onClick={resetErrorBoundary}>
                    try again
                </button>
                .
            </p>
            <pre style={{ color: "red" }}>{error.message}</pre>
        </div>
    );
};
