import React from 'react';

const AppErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div>
      <h2 className='txt-bold'>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

export default AppErrorBoundaryFallback;
