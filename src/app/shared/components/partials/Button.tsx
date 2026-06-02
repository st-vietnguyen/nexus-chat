import React, { FC } from 'react';
import { Spinner } from '../common';

interface ButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
  btnRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  isDisabled = false,
  isLoading = false,
  className = 'btn-primary',
  onClick,
  type = 'submit',
  btnRef,
  children,
}) => {
  return (
    <button
      className={`btn ${className}`}
      ref={btnRef}
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      {children}
      {isLoading && <Spinner className="spinner-sm" />}
    </button>
  );
};
