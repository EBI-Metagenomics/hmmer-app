import _, { divide } from "lodash";
import { useCallback, useState, useEffect } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { useDropzone } from "react-dropzone";

import { useFileContent } from "@hooks/useFileContent";

import { ProgressIndicator } from "@components/atoms/ProgressIndicator";

import "./index.scss";

const EXAMPLE_SEQUENCE =
  ">2abl_A mol:protein length:163  ABL TYROSINE KINASE\nMGPSENDPNLFVALYDFVASGDNTLSITKGEKLRVLGYNHNGEWCEAQTKNGQGWVPSNYITPVNSLEKHSWYHGPVSRNAAEYLLSSGINGSFLVRESESSPGQRSISLRYEGRVYHYRINTASDGKLYVSSESRFNTLAELVHHHSTVADGLITTLHYPAP";

export const SequenceInput: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const { content, error: fileError, isLoading } = useFileContent(file);
  const {
    register,
    setValue,
    watch,
    resetField,
    formState: { isSubmitted, isSubmitting },
  } = useFormContext();

  useEffect(() => {
    if (content) {
      setValue("seq", content, { shouldDirty: true });
    }
  }, [content, setValue]);

  useEffect(() => {
    const { unsubscribe } = watch((value, { name }) => {
      if (name === "seq") {
        setIsEmpty(value.seq === "");
        if (value.seq === "") {
          setFile(null)
        }
      }
    });

    return () => unsubscribe();
  }, [watch]);

  const resetSequenceInput = () => {
    setFile(null);
    resetField("seq");
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    noClick: true,
  });
  console.log(isSubmitting);
  return (
    <div {...getRootProps({ className: "sequence-input-wrapper" })}>
      <textarea
        rows={10}
        className="vf-form__textarea vf-font-plex-mono"
        {...register("seq")}
        readOnly={isLoading}
      />
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="sequence-input-helper-text vf-text-body vf-text-body--3 disable-parent">
          <span>Drop the files here ...</span>
        </div>
      )}

      {isLoading && (
        <div
          className="sequence-input-helper-text vf-text-body vf-text-body--3 disable-parent"
          hidden={!isEmpty || isSubmitted}
        >
          Processing {file?.name}... <ProgressIndicator width={"80%"} />
        </div>
      )}

      {fileError && (
        <div className="sequence-input-helper-text vf-text-body vf-text-body--3 disable-parent">
          <p className="vf-text--error">Error with file {file?.name}</p>
          <p className="vf-text--error">{fileError.message}</p>
          <a
            onClick={(e) => {
              e.preventDefault();
              resetSequenceInput();
            }}
            className="vf-link"
          >
            Start over
          </a>
        </div>
      )}

      {isEmpty && !isLoading && (
        <div className="sequence-input-helper-text vf-text-body vf-text-body--3">
          <span>
            {" "}
            Paste in your sequence, use the{" "}
            <a
              onClick={(e) => {
                e.preventDefault();
                setValue("seq", EXAMPLE_SEQUENCE, { shouldDirty: true });
              }}
              className="vf-link"
            >
              example
            </a>
            , drag a file over or{" "}
            <a
              onClick={(e) => {
                e.preventDefault();
                open();
              }}
              className="vf-link"
            >
              choose a file to upload
            </a>
          </span>
        </div>
      )}

      {isSubmitting && (
        <div className="sequence-input-helper-text disable-parent">
          <span>Submitting your search...</span>
          <ProgressIndicator width={"80%"} />
        </div>
      )}

      {(file && !isSubmitting) && <div className="filename-container">{file.name}</div>}
    </div>
  );
};
