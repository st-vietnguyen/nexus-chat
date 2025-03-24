import React from 'react';

interface WithLoadingProps {
  isLoading: boolean;
}

const WithLoading =
  <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  (props: P & WithLoadingProps) => {
    const { isLoading, ...rest } = props;

    if (isLoading) {
      return <span className="loader"></span>;
    }

    return <WrappedComponent {...(rest as P)} />;
  };

export default WithLoading;
