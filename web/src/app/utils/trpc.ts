import type { AppRouter } from "@project/api";
import { QueryClient } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      queryClient,
      links: [
        httpLink({
          url: `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
          }/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    };
  },
  ssr: false,
});
