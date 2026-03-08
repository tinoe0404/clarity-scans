"use client";

import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { buttonStyles, cardStyles, screenContainerStyles } from "@/lib/styles";

export default function ErrorPage({
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
    <main className={screenContainerStyles()}>
      <div className="flex h-full min-h-[60vh] w-full flex-1 flex-col items-center justify-center text-center">
        <div className={cardStyles("important") + " mx-auto w-full max-w-sm space-y-6 p-8"}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-medical-red/10 text-medical-red">
            <Icon name="AlertTriangle" size="lg" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-gray-400">
              {process.env.NODE_ENV === "development"
                ? error.message
                : "An unexpected error occurred while loading this page."}
            </p>
          </div>

          <button onClick={() => reset()} className={buttonStyles("primary", "md")}>
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
