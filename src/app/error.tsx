"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/Button";
import StatusMessage from "@/components/StatusMessage";

// Shown when a page throws while rendering, e.g. when PokéAPI is down or
// rate-limiting us. Must be a Client Component (the "use client" above).
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  // In Next.js 16.4 the prop is called `retry` and re-fetches the server data;
  // other versions' docs call it `reset` or `unstable_retry`.
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
      <Button onClick={() => retry()}>Try again</Button>
      <ButtonLink href="/pokemon">Back to the Pokémon list</ButtonLink>
    </StatusMessage>
  );
}
