import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => (
  <div className={`spinner ${className}`}>
    {[...Array(3)].map((_, index) => (
      <span key={index} className="bounce" />
    ))}
  </div>
);
