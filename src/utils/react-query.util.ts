import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { parseError } from './axios.util';

/** onError handler for mutations: shows the API message as a toast. */
export function throwError(title: string = 'Request failed') {
  return (error: unknown) => {
    toast.error(title, { description: parseError(error) });
  };
}

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnMount: false,
      },
    },
  });
}
