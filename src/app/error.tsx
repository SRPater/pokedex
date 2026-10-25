"use client";

import { useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";
import { Button, ButtonLink } from "@/components/Button";

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
      <Button onClick={() => retry()}>Try again</Button>
      <ButtonLink href="/pokemon">Back to the Pokémon list</ButtonLink>
    </StatusMessage>
  );
}
