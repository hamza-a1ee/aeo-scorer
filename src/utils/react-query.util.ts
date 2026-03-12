import toast from "react-hot-toast";
import { parseError } from "./axios.util";
import { QueryClient } from "@tanstack/react-query";

export function throwError(key: string = "React query") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (error: any) => {
    toast.error(parseError(error));
  };
}

export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnMount: false,
      },
    },
  });
}
