// components/atoms/Checkbox/index.tsx
import React, { InputHTMLAttributes, useEffect, useRef } from "react";

import "./index.scss";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helper?: string;
  invalid?: boolean;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  helper,
  invalid,
  indeterminate,
  className = "",
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <span className="checkbox-wrapper">
      <input
        ref={inputRef}
        key={inputRef.current?.id}
        type="checkbox"
        className={`checkbox ${invalid ? "checkbox--invalid" : ""} ${className}`}
        {...props}
      />
      {label && (
        <label className="checkbox-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      {helper && <span className="checkbox-helper">{helper}</span>}
    </span>
  );
};
