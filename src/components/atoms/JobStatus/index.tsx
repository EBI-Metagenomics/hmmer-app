interface JobStatusProps {
    status?: string;
}

export const JobStatus: React.FC<JobStatusProps> = ({ status }) => {
    return (
        <span
            style={{
                color: status === "SUCCESS" ? "#18974c" : status === "FAILURE" ? "#d32f2f" : "",
            }}
        >
            {status ?? ""}
        </span>
    );
};
