import React from 'react';
import alertError from '/icons/alert-error.svg';

const AppErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="pages-container">
      <img className="error-icon" src={alertError} />
      <h2 className="txt-bold">Opps, Something went wrong...</h2>
      <p className="error-message">{error.message}</p>
      <button onClick={resetErrorBoundary} className="btn btn-primary">
        Try again
      </button>
    </div>
  );
};

export default AppErrorBoundaryFallback;
