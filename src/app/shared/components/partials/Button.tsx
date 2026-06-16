import React, { FC } from 'react';
import { Spinner } from '../common/Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'primary-outline'
  | 'danger-outline'
  | 'gray-outline'
  | 'ghost';

interface ButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
  btnRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

export const Button: FC<ButtonProps> = ({
  isDisabled = false,
  isLoading = false,
  variant = 'primary',
  className = '',
  onClick,
  type = 'submit',
  btnRef,
  children,
}) => {
  const classes = className
    ? `btn btn-${variant} ${className}`
    : `btn btn-${variant}`;

  return (
    <button
      className={classes}
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
