import React from 'react';

const AppErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="pages-container">
      <h2 className='txt-bold'>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

export default AppErrorBoundaryFallback;
