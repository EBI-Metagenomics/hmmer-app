import "./index.scss";

interface ProgressIndicatorProps {
  percent?: number; // undefined for indeterminate
  width?: number | string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percent,
  width,
}) => {
  const isIndeterminate = percent === undefined;

  return (
    <div className="vf-progress-indicator" style={{width: width || "100%"}}>
      <div
        className={`vf-progress-indicator__mark ${isIndeterminate ? "vf-progress-indicator__mark--indeterminate" : ""}`}
        style={
          !isIndeterminate
            ? ({
                "--vf-progress-indicator__percent": `${percent}%`,
              } as React.CSSProperties)
            : undefined
        }
      />
    </div>
  );
};
