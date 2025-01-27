import { useFormContext } from "react-hook-form";

export const CutOffInput: React.FC = () => {
  const { register, watch } = useFormContext();
  const threshold = watch("threshold");

  return (
    <div className="vf-stack vf-stack--400">
      <div className="vf-cluster">
        <div className="vf-form__item">
          <div className="vf-form__radio-group">
            <input
              {...register("threshold")}
              type="radio"
              value="evalue"
              className="vf-form__radio"
              id="evalue"
            />
            <label htmlFor="evalue" className="vf-form__label">
              E-value
            </label>
          </div>
          <div className="vf-form__radio-group">
            <input
              {...register("threshold")}
              type="radio"
              value="bitscore"
              className="vf-form__radio"
              id="bitscore"
            />
            <label htmlFor="bitscore" className="vf-form__label">
              Bit Score
            </label>
          </div>
        </div>
      </div>
      {threshold === "evalue" && <EvalueInput />}
      {threshold === "bitscore" && <BitscoreInput />}
    </div>
  );
};

const EvalueInput = () => {
  const { register } = useFormContext();

  return (
    <div className="vf-stack vf-stack--200">
      <div className="vf-form__item vf-cluster vf-cluster--200">
        <div className="vf-cluster__inner">
          <p className="vf-u-type__text-body--2 vf-u-width__25">
            Significance E-values
          </p>
          <div className="vf-form__item">
            <label htmlFor="incE" className="vf-form__label">
              Sequence
            </label>
            <input
              {...register("incE")}
              className="vf-form__input"
              type="number"
              step="any"
              id="incE"
            />
          </div>
          <div className="vf-form__item">
            <label htmlFor="incdomE" className="vf-form__label">
              Hit
            </label>
            <input
              {...register("incdomE")}
              className="vf-form__input"
              type="number"
              step="any"
              id="incdomE"
            />
          </div>
        </div>
      </div>
      <div className="vf-form__item vf-cluster vf-cluster--200">
        <div className="vf-cluster__inner">
          <p className="vf-u-type__text-body--2 vf-u-width__25">
            Report E-values
          </p>
          <div className="vf-form__item">
            <label htmlFor="E" className="vf-form__label">
              Sequence
            </label>
            <input
              {...register("E")}
              className="vf-form__input"
              type="number"
              step="any"
              id="E"
            />
          </div>
          <div className="vf-form__item">
            <label htmlFor="domE" className="vf-form__label">
              Hit
            </label>
            <input
              {...register("domE")}
              className="vf-form__input"
              type="number"
              step="any"
              id="domE"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BitscoreInput = () => {
  const { register } = useFormContext();

  return (
    <div className="vf-stack vf-stack--200">
      <div className="vf-form__item vf-cluster vf-cluster--200">
        <div className="vf-cluster__inner">
          <p className="vf-u-type__text-body--2 vf-u-width__25">
            Significance Bit scores
          </p>
          <div className="vf-form__item">
            <label htmlFor="incT" className="vf-form__label">
              Sequence
            </label>
            <input
              {...register("incT")}
              className="vf-form__input"
              type="number"
              step="any"
              id="incT"
            />
          </div>
          <div className="vf-form__item">
            <label htmlFor="incdomT" className="vf-form__label">
              Hit
            </label>
            <input
              {...register("incdomT")}
              className="vf-form__input"
              type="number"
              step="any"
              id="incdomT"
            />
          </div>
        </div>
      </div>
      <div className="vf-form__item vf-cluster vf-cluster--200">
        <div className="vf-cluster__inner">
          <p className="vf-u-type__text-body--2 vf-u-width__25">
            Report Bit scores
          </p>
          <div className="vf-form__item">
            <label htmlFor="T" className="vf-form__label">
              Sequence
            </label>
            <input
              {...register("T")}
              className="vf-form__input"
              type="number"
              step="any"
              id="T"
            />
          </div>
          <div className="vf-form__item">
            <label htmlFor="domT" className="vf-form__label">
              Hit
            </label>
            <input
              {...register("domT")}
              className="vf-form__input"
              type="number"
              step="any"
              id="domT"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
