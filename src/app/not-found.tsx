import { ButtonLink } from "@/components/Button";
import StatusMessage from "@/components/StatusMessage";

// Shown for every 404: unknown URLs, and the notFound() calls in the list and detail pages.
export default function NotFound() {
  return (
    <StatusMessage
      title="Page not found"
      message="We couldn't find what you were looking for. The Pokémon may not exist, or the address may be mistyped."
    >
      <ButtonLink href="/pokemon">Back to the Pokémon list</ButtonLink>
    </StatusMessage>
  );
}
