"use client";

import { showError } from "@/lib/utils";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import React from "react";
import { Toaster } from "../ui/sonner";
import { ToasterProps } from "sonner";
import { AxiosError } from "axios";

type Props = {
  children: React.ReactNode;
  token?: RequestCookie;
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      showError(error as AxiosError<any>);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) {
        return;
      }
      showError(error as AxiosError<any>);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: Props) {
  const { resolvedTheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={true} /> */}
      <Toaster richColors theme={resolvedTheme as ToasterProps["theme"]} />
    </QueryClientProvider>
  );
}
