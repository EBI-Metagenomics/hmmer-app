import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const HMMDatabaseInput: React.FC = () => {
    const { register, setValue } = useFormContext();

    useEffect(() => {
      setValue("database", "pfam", { shouldValidate: false})
    }, []);

    return (
        <div className="vf-form__item">
            <select {...register("database")} className="vf-form__select" id="vf-form__select">
                <option key="pfam" value="pfam">
                    Pfam
                </option>
            </select>
        </div>
    );
};
