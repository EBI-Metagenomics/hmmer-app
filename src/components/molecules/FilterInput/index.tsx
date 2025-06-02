import { useFormContext } from "react-hook-form";

export const FilterInput: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="vf-form__item vf-form__item--checkbox">
      <input
        {...register("nobias")}
        type="checkbox"
        id="nobias"
        className="vf-form__checkbox"
      />
      <label htmlFor="nobias" className="vf-form__label">
        Turn off bias composition filter
      </label>
      {errors.nobias && <p className="vf-form__helper vf-form__helper--error">{errors.nobias.message as string}</p>}
    </div>
  );
};
