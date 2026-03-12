"use client";

// React Query Imports
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// React Imports
import { FC, ReactNode, useState } from "react";

interface IReactQueryProviderProps {
  children: ReactNode;
}
const ReactQueryProvider: FC<IReactQueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <>
        <ReactQueryDevtools initialIsOpen={false} client={queryClient} />
        {children}
      </>
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
