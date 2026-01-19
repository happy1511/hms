"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useTheme } from "next-themes";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import React from "react";
import { Toaster } from "../ui/sonner";
import { ToasterProps } from "sonner";

type Props = {
  children: React.ReactNode;
  token?: RequestCookie;
};

const queryClient = new QueryClient();

export default function Providers({ children }: Props) {
  const { resolvedTheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={true} />
      <Toaster richColors theme={resolvedTheme as ToasterProps["theme"]} />
    </QueryClientProvider>
  );
}
