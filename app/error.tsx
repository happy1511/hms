"use client";

import PageState from "@/components/common/PageState";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="p-4">
      <PageState
        variant="error"
        title="Page error"
        description={
          error.message || "Something unexpected happened while rendering this page."
        }
        actionLabel="Try again"
        onAction={reset}
      />
    </main>
  );
}
