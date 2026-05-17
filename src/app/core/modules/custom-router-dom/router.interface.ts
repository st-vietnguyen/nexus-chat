import { LazyExoticComponent, ReactElement } from 'react';

export interface PageRoute {
  path: string;
  element?: LazyExoticComponent<() => ReactElement>;
  isProtected?: boolean; // default is false,
  redirect?: string;
  children?: PageRoute[];
  loader?: () => Promise<unknown>;
}
