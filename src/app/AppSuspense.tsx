import React, {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from 'react';

/*
 * Suspense renders component and hiding it with `display: none;` and show fallback.
 * Using Context and Provider for tracking.
 * If we need to do something when exactly component rendered,
 * please use the `useSuspended` hook.
 */
const SuspenseContext = createContext(false);

export const useSuspended = () => {
  return useContext(SuspenseContext);
};

// Create AppSuspense extend Suspense from React
export default function AppSuspense({ fallback, children }) {
  const [suspended, setSuspended] = useState(true);

  // Fallback component for tracking `suspensed` or `not`, something like trick :D
  const Fallback = (props) => {
    useEffect(() => {
      // In-suspense
      setSuspended(true);

      // When this component be destroyed, that mean Suspense is gone!
      return () => setSuspended(false);
    }, []);

    return props.children;
  };

  return (
    <Suspense fallback={<Fallback>{fallback}</Fallback>}>
      {/* Export `suspended` to children */}
      <SuspenseContext.Provider value={suspended}>
        {children}
      </SuspenseContext.Provider>
    </Suspense>
  );
}

AppSuspense.defaultProps = {
  fallback: null,
  children: null,
};
