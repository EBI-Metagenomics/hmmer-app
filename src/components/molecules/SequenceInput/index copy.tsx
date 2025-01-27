import _ from "lodash";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

const EXAMPLE_SEQUENCE =
  ">2abl_A mol:protein length:163  ABL TYROSINE KINASE\nMGPSENDPNLFVALYDFVASGDNTLSITKGEKLRVLGYNHNGEWCEAQTKNGQGWVPSNYITPVNSLEKHSWYHGPVSRNAAEYLLSSGINGSFLVRESESSPGQRSISLRYEGRVYHYRINTASDGKLYVSSESRFNTLAELVHHHSTVADGLITTLHYPAP";

const SequenceEditor: React.FC = () => {
  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useFormContext();
  const validateFasta = (fasta: string): Record<string, string> | undefined => {
    const lines = value.trim().split("\n");

    // Check if starts with FASTA header
    if (!lines[0].startsWith(">")) {
      return "Sequence must start with a FASTA header (>)";
    }

    // Check sequence lines
    const seqLines = lines.slice(1);
    if (seqLines.length === 0) {
      return "No sequence found after header";
    }

    // Validate sequence characters
    const sequence = seqLines.join("").trim();
    const validChars = /^[A-Za-z\s]+$/;
    if (!validChars.test(sequence)) {
      return "Sequence can only contain letters and spaces";
    }

    return true;
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "seq") {
        const trimmed = _.trim(value["seq"]);

        if (!trimmed) {
          return;
        }

        setError("seq", {
          types: {
            fastaFormat: "Invalid FASTA format",
            noSequence: "No sequence found after header",
          },
        });
        // const sequences = _.split(value["seq"], /[\r\n](?=>)/);
        // // console.log(sequences);
        // const [header, sequence] = _.split(sequences[0], /(?<=>)\s*/);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div>
      {/* <label className="vf-form__label" htmlFor="seq">
        Sequence{" "}
        <button
          className="vf-button vf-button--link"
          onClick={(e) => {
            e.preventDefault();
            setValue("seq", EXAMPLE_SEQUENCE);
          }}
        >
          example
        </button>
      </label> */}
      <textarea
        rows={10}
        className="vf-form__textarea vf-font-plex-mono"
        style={{ height: "10em", resize: "none" }}
        {...register("seq")}
      ></textarea>
      <ErrorMessage
        errors={errors}
        name="seq"
        render={({ messages }) =>
          messages &&
          _.map(messages, (message, type) => (
            <p className="vf-form__helper vf-form__helper--error" key={type}>
              {message}
            </p>
          ))
        }
      />
    </div>
  );
};

export default SequenceEditor;
