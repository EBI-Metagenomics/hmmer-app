import { decompress } from "fflate";
import { useState, useEffect } from "react";

export const useFileContent = (file: File | null) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const processFile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const startTime = Date.now();
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);

        // Check if file is compressed (gzip/zip)
        const isCompressed =
          (data[0] === 0x1f && data[1] === 0x8b) || // gzip
          (data[0] === 0x50 &&
            data[1] === 0x4b &&
            data[2] === 0x03 &&
            data[3] === 0x04); // zip

        const content = await (isCompressed
          ? new Promise<string>((resolve, reject) => {
              decompress(data, (error, decompressed) => {
                if (error) {
                  reject(new Error(`Failed to decompress file`));
                } else {
                  resolve(new TextDecoder().decode(decompressed));
                }
              });
            })
          : Promise.resolve(new TextDecoder().decode(data)));

        // Ensure minimum processing time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 500 - elapsedTime;

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        setContent(content);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    processFile();
  }, [file]);

  return { content, error, isLoading };
};
