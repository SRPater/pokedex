import StatusMessage from "@/components/StatusMessage";
import { ButtonLink } from "@/components/Button";

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
