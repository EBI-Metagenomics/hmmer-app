import { useMemo } from "react";
import { P7AlignmentDisplay } from "@/client/types.gen";

import "./index.scss";

type AlignmentBlock = {
  hmmLinebit: string;
  matchLinebit: string;
  ppLinebit: string;
  seqLinebit: string;
  modStart: number;
  modEnd: number;
  seqStart: number;
  seqEnd: number;
};

type AlignmentProps = {
  alignment: P7AlignmentDisplay;
  algorithm: string;
  alignmentOnly?: boolean;
};

const AlignmentCounter = ({ length }: { length: number }) => {
  const aliCountStr = ".........*";
  const aliCountStrAll = aliCountStr.repeat(Math.ceil(80 / 10));
  const spacer = "\u00A0";

  return (
    <div>
      {spacer.repeat(13)}
      {aliCountStrAll.substr(0, length)}
    </div>
  );
};

const HMMLine = ({
  hmmLinebit,
  matchLinebit,
  modStart,
  modEnd,
  hmmname,
}: {
  hmmLinebit: string;
  matchLinebit: string;
  modStart: number;
  modEnd: number;
  hmmname: string;
}) => {
  const markupHMM = (hmmLinebit: string, matchLinebit: string) => {
    let pos = 0;
    let prevChar = "";
    let result = '<span class="hmmmatch">';

    const chunks = matchLinebit.match(/((.)\2*)/g) || [];

    for (const chunk of chunks) {
      const char = chunk[0];
      if (char === prevChar) continue;
      prevChar = char;

      const hmmChunk = hmmLinebit.substr(pos, chunk.length);

      if (char === " ") {
        result += `<span class="hmmminus">${hmmChunk}</span>`;
      } else if (char === "+") {
        result += `<span class="hmmplus">${hmmChunk}</span>`;
      } else {
        result += hmmChunk;
      }

      pos += chunk.length;
    }

    return result + "</span>";
  };

  return (
    <div>
      {hmmname}{" ".repeat(6 - hmmname.length)}
      {String(modStart).padStart(5, "\u00A0")}
      &nbsp;
      <span
        dangerouslySetInnerHTML={{
          __html: markupHMM(hmmLinebit, matchLinebit),
        }}
      />
      &nbsp;
      {String(modEnd).padEnd(5, "\u00A0")}
      &nbsp;&nbsp;
    </div>
  );
};

const MatchLine = ({ matchLinebit }: { matchLinebit: string }) => (
  <div>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    {matchLinebit.replace(/ /g, "\u00A0")}
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>
);

const SequenceLine = ({
  seqLinebit,
  ppLinebit,
  seqStart,
  seqEnd,
  seqname,
}: {
  seqLinebit: string;
  ppLinebit: string;
  seqStart: number;
  seqEnd: number;
  seqname: string;
}) => {
  const markupSeq = (seqLinebit: string, ppLinebit: string) => {
    let pos = 0;
    let prevChar = "";
    let maxChunkLength = 0;
    let max = "";

    const chunks = ppLinebit.match(/((.)\2*)/g) || [];
    const validChunks = chunks.filter((chunk) => {
      const char = chunk[0];
      if (char === prevChar) return false;
      prevChar = char;

      if (chunk.length > maxChunkLength) {
        maxChunkLength = chunk.length;
        max = char;
      }
      return true;
    });

    max = max === "*" ? "star" : max === "." ? "gap" : max;
    let result = `<span class="heat${max}">`;

    pos = 0;
    for (const chunk of validChunks) {
      let first = chunk[0];
      first = first === "*" ? "star" : first === "." ? "gap" : first;

      const seqChunk = seqLinebit.substr(pos, chunk.length);

      if (first === max) {
        result += seqChunk;
      } else {
        result += `<span title="${first}" class="heat${first}">${seqChunk}</span>`;
      }

      pos += chunk.length;
    }

    return result + "</span>";
  };

  return (
    <div>
      {seqname}{" ".repeat(6 - seqname.length)}
      {String(seqStart).padStart(5, "\u00A0")}
      &nbsp;
      <span
        dangerouslySetInnerHTML={{
          __html: markupSeq(seqLinebit, ppLinebit),
        }}
      />
      &nbsp;
      {String(seqEnd).padEnd(5, "\u00A0")}
      &nbsp;&nbsp;
    </div>
  );
};

const PPLine = ({ ppLinebit }: { ppLinebit: string }) => (
  <div>
    PP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    {ppLinebit.replace(/ /g, "\u00A0")}
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  </div>
);

const AlignmentBlockComponent = ({
  block,
  hmmname,
  seqname,
}: {
  block: AlignmentBlock;
  hmmname: string;
  seqname: string;
}) => (
  <div>
    <AlignmentCounter length={block.hmmLinebit.length} />
    <HMMLine {...block} hmmname={hmmname} />
    <MatchLine matchLinebit={block.matchLinebit} />
    <SequenceLine {...block} seqname={seqname} />
    <PPLine ppLinebit={block.ppLinebit} />
    <br />
  </div>
);

export const Alignment: React.FC<AlignmentProps> = ({
  alignment,
  algorithm,
  alignmentOnly = false,
}) => {
  const width = 80;

  const { hmmname, seqname } =
    algorithm === "hmmscan"
      ? { hmmname: "Target", seqname: "Query" }
      : { hmmname: "Query", seqname: "Target" };

  // Split alignment into blocks
  const blocks: AlignmentBlock[] = useMemo(() => {
    const result: AlignmentBlock[] = [];
    let i = 0;
    let modStart = alignment.hmmfrom;
    let seqStart = alignment.sqfrom;

    while (i * width < alignment.model.length) {
      const hmmLinebit = alignment.model.substr(i * width, width);
      const matchLinebit = alignment.mline.substr(i * width, width);
      const ppLinebit = alignment.ppline?.substr(i * width, width) ?? "";
      const seqLinebit = alignment.aseq?.substr(i * width, width) ?? "";

      const modEnd = modStart + (hmmLinebit.match(/[A-Za-z]/g) || []).length - 1;
      const seqEnd = seqStart + (seqLinebit.match(/[A-Za-z]/g) || []).length - 1;

      result.push({
        hmmLinebit,
        matchLinebit,
        ppLinebit,
        seqLinebit,
        modStart,
        modEnd,
        seqStart,
        seqEnd,
      });

      i++;
      modStart = modEnd + 1;
      seqStart = seqEnd + 1;
    }

    return result;
  }, [alignment, width]);

  return (
    <pre>
      {!alignmentOnly && (
        <div className="alimeta">{/* Meta information table here */}</div>
      )}

      <div className="alignment vf-font-plex-mono">
        {blocks.map((block, blockIndex) => (
          <AlignmentBlockComponent
            key={blockIndex}
            block={block}
            hmmname={hmmname}
            seqname={seqname}
          />
        ))}
      </div>
    </pre>
  );
};
