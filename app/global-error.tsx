"use client";

import PageState from "@/components/common/PageState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background p-4">
        <PageState
          variant="error"
          title="Application error"
          description={
            error.message || "The application hit an unexpected error."
          }
          actionLabel="Reload section"
          onAction={reset}
        />
      </body>
    </html>
  );
}
