"use client";

import { useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";
import ButtonLink from "@/components/ButtonLink";

// Shown when an page throws while rendering, e.g. when PokéAPI is down or
// rate-limiting us. Must be a Client Component (the "use client" above).
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusMessage
      title="Something went wrong"
      message="We couldn't load this page. PokéAPI may be unavailable or slow right now, so please try again in a moment."
    >
      <button
        onClick={retry}
        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800"
      >
        Try again
      </button>
      <ButtonLink href="/pokemon">Back to the Pokémon list</ButtonLink>
    </StatusMessage>
  );
}
