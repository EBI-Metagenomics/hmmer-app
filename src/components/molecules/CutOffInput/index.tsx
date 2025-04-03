import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface CutOffInputProps {
    algo: "phmmer" | "hmmscan" | "hmmsearch" | "jackhmmer";
}

export const CutOffInput: React.FC<CutOffInputProps> = ({ algo }) => {
    const { register, watch, setValue } = useFormContext();
    const threshold = watch("threshold");

    useEffect(() => {
        if (algo === "hmmscan") {
            setValue("threshold", "cut_ga");
        }

        if (threshold === "cut_ga" && algo !== "hmmscan") {
            setValue("threshold", "evalue");
        }
    }, [algo, setValue]);

    return (
        <div className="vf-stack vf-stack--400">
            <div className="vf-cluster">
                <div className="vf-form__item">
                    {algo === "hmmscan" && (
                        <div className="vf-form__radio-group">
                            <input
                                {...register("threshold")}
                                type="radio"
                                value="cut_ga"
                                className="vf-form__radio"
                                id="cut_ga"
                            />
                            <label htmlFor="cut_ga" className="vf-form__label">
                                Gathering
                            </label>
                        </div>
                    )}
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
            {threshold === "cut_ga" && (
                <div className="vf-u-padding__top--400">
                    <p className="vf-text-body vf-text-body--2 vf-u-text-color--grey">Use the gathering threshold</p>
                </div>
            )}
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
                    <p className="vf-u-type__text-body--2 vf-u-width__25" style={{ flex: "10% 1 0" }}>
                        Significance E-values
                    </p>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="incE" className="vf-form__label">
                            Sequence
                        </label>
                        <input
                            {...register("incE", { valueAsNumber: true })}
                            className="vf-form__input"
                            type="number"
                            step="any"
                            id="incE"
                        />
                    </div>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="incdomE" className="vf-form__label">
                            Hit
                        </label>
                        <input
                            {...register("incdomE", { valueAsNumber: true })}
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
                    <p className="vf-u-type__text-body--2 vf-u-width__25" style={{ flex: "10% 1 0" }}>
                        Report E-values
                    </p>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="E" className="vf-form__label">
                            Sequence
                        </label>
                        <input
                            {...register("E", { valueAsNumber: true })}
                            className="vf-form__input"
                            type="number"
                            step="any"
                            id="E"
                        />
                    </div>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="domE" className="vf-form__label">
                            Hit
                        </label>
                        <input
                            {...register("domE", { valueAsNumber: true })}
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
                    <p className="vf-u-type__text-body--2 vf-u-width__25" style={{ flex: "10% 1 0" }}>
                        Significance Bit scores
                    </p>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="incT" className="vf-form__label">
                            Sequence
                        </label>
                        <input
                            {...register("incT", { valueAsNumber: true })}
                            className="vf-form__input"
                            type="number"
                            step="any"
                            id="incT"
                        />
                    </div>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="incdomT" className="vf-form__label">
                            Hit
                        </label>
                        <input
                            {...register("incdomT", { valueAsNumber: true })}
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
                    <p className="vf-u-type__text-body--2 vf-u-width__25" style={{ flex: "10% 1 0" }}>
                        Report Bit scores
                    </p>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="T" className="vf-form__label">
                            Sequence
                        </label>
                        <input
                            {...register("T", { valueAsNumber: true })}
                            className="vf-form__input"
                            type="number"
                            step="any"
                            id="T"
                        />
                    </div>
                    <div className="vf-form__item" style={{ flex: "25% 1 0" }}>
                        <label htmlFor="domT" className="vf-form__label">
                            Hit
                        </label>
                        <input
                            {...register("domT", { valueAsNumber: true })}
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
