import _ from "lodash";
import { useFormContext } from "react-hook-form";

export const IterationsInput: React.FC = () => {
    const { register } = useFormContext();
    return (
        <div className="vf-form__item">
            <select {...register("iterations", { valueAsNumber: true })} className="vf-form__select vf-u-width__25" id="vf-form__select">
                {_.times(5, (index) => (
                    <option key={index} value={index + 1}>
                        {index + 1}
                    </option>
                ))}
            </select>
        </div>
    );
};
