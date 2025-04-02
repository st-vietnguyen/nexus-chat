import React, { useState } from 'react';

interface InputProps {
  type: string;
  name: string;
  label?: string;
  placeHolder?: string;
  className?: string;
  maxLength?: number;
  errorMsg?: string;
  minLength?: number;
  onBlur?: (value: string) => void;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  hasApiErr?: boolean;
  isDisabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type,
  name,
  label,
  placeHolder,
  className = '',
  maxLength,
  errorMsg,
  onBlur,
  onChange,
  isReadOnly = false,
  hasApiErr = false,
  isDisabled = false,
}) => {
  const [inputState, setInputState] = useState({ dirty: false, touched: false });

  const isShowError = () => (inputState.dirty || hasApiErr) && errorMsg;

  const inputClassName = `form-control ${className} ${isShowError() ? 'is-invalid' : ''}`;


  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setInputState(prev => ({ ...prev, dirty: true, touched: false }));
    onBlur?.(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleFocus = () => {
    setInputState(prev => ({ ...prev, touched: true }));
  };

  return (
    <div className="form-group">
      <div className="input-group">
        <input
          className={inputClassName}
          type={type}
          name={name}
          placeholder={label || placeHolder}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          readOnly={isReadOnly}
          disabled={isDisabled}
        />
        {label && <label className="form-label" htmlFor={name}>{label}</label>}
      </div>
      {isShowError() && <span className="msg-error">{errorMsg}</span>}
    </div>
  );
};
