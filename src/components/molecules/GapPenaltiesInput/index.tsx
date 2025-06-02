import { useFormContext } from "react-hook-form";

export const GapPenaltiesInput: React.FC = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="vf-stack vf-stack--200">
            <div className="vf-form__item">
                <label htmlFor="popen" className="vf-form__label">
                    Open
                </label>
                <input
                    {...register("popen", { valueAsNumber: true })}
                    className="vf-form__input"
                    type="number"
                    step="any"
                    id="popen"
                />
                {errors.popen && <p className="vf-form__helper vf-form__helper--error">{errors.popen.message as string}</p>}
            </div>
            <div className="vf-form__item">
                <label htmlFor="pextend" className="vf-form__label">
                    Extend
                </label>
                <input
                    {...register("pextend", { valueAsNumber: true })}
                    className="vf-form__input"
                    type="number"
                    step="any"
                    id="pextend"
                />
                {errors.pextend && <p className="vf-form__helper vf-form__helper--error">{errors.pextend.message as string}</p>}
            </div>
            <div className="vf-form__item">
                <label className="vf-form__label" htmlFor="mx">
                    Substitution scoring matrix
                </label>
                <select {...register("mx")} className="vf-form__select" id="mx">
                    <option key="BLOSUM45" value="BLOSUM45">
                        BLOSUM45
                    </option>
                    <option key="BLOSUM62" value="BLOSUM62">
                        BLOSUM62
                    </option>
                    <option key="BLOSUM90" value="BLOSUM90">
                        BLOSUM90
                    </option>
                    <option key="PAM30" value="PAM30">
                        PAM30
                    </option>
                    <option key="PAM70" value="PAM70">
                        PAM70
                    </option>
                    <option key="PAM250" value="PAM250">
                        PAM250
                    </option>
                </select>
                {errors.mx && <p className="vf-form__helper vf-form__helper--error">{errors.mx.message as string}</p>}
            </div>
        </div>
    );
};
