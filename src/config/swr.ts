import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't revalidate on window focus
  revalidateOnReconnect: false, // Don't revalidate when browser regains connection
};
