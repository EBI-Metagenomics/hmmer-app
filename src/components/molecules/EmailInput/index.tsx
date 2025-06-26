import { useFormContext } from "react-hook-form";

export const EmailInput: React.FC = () => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="vf-form__item vf-u-width__25">
      <input
        {...register("email_address")}
        type="email"
        id="email_address"
        className="vf-form__input"
      />
      {errors.email_address && <p className="vf-form__helper vf-form__helper--error">{errors.email_address.message as string}</p>}
    </div>
  );
};