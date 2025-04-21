import React, { FC } from 'react';
import { Spinner } from '../common';

interface ButtonProps {
  title: React.ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
  btnRef?: React.Ref<HTMLButtonElement>;
}

export const Button: FC<ButtonProps> = ({
  title,
  isDisabled = false,
  isLoading = false,
  className = 'btn-primary',
  onClick,
  type = 'submit',
  btnRef,
}) => {
  return (
    <button
      className={`btn ${className}`}
      ref={btnRef}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
    >
      <span>{title}</span>
      {isLoading && <Spinner className="spinner-sm" />}
    </button>
  );
};
