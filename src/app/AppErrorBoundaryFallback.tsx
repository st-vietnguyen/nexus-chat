import AlertErrorIcon from '@assets/icons/ic-alert-error.svg?react';

const AppErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="pages-container">
      <AlertErrorIcon className="error-icon" />
      <h2 className="txt-bold">Opps, Something went wrong...</h2>
      <p className="error-message">{error.message}</p>
      <button onClick={resetErrorBoundary} className="btn btn-primary">
        Try again
      </button>
    </div>
  );
};

export default AppErrorBoundaryFallback;
