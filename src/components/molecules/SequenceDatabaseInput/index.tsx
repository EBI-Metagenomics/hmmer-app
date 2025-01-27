import { useFormContext } from "react-hook-form";

export const SequenceDatabaseInput: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="vf-form__item">
      <select
        {...register("seqdb")}
        className="vf-form__select"
        id="vf-form__select"
      >
        <option key="refprot" value="refprot">
          Reference Proteomes
        </option>
        <option key="swissprot" value="swissprot">
          SwissProt
        </option>
        <option key="uniprot" value="uniprot">
          UniProt
        </option>
        <option key="pdb" value="pdb">
          PDB
        </option>
        <optgroup label="Representative Proteomes (UniProt)">
          <option key="rp75" value="rp75">
            rp75
          </option>
          <option key="rp55" value="rp55">
            rp55
          </option>
          <option key="rp35" value="rp35">
            rp35
          </option>
          <option key="rp15" value="rp15">
            rp15
          </option>
        </optgroup>
      </select>
    </div>
  );
};
