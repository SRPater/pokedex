"use client";

import { Button } from "./Button";

// Plays one Pokémon cry. This is a client component because it needs a click
// handler and the browser's Audio, neither of which exist on the server.
export default function CryButton({ src }: { src: string }) {
  function play() {
    // A new Audio per click, so the sound always matches the current `src`
    // (the page re-renders with a new one when you switch form) and nothing
    // is downloaded until someone asks for it.
    new Audio(src).play().catch(() => {
      // play() rejects if the file can't load. A missing cry isn't worth an
      // error page, so ignore it.
    });
  }

  return (
    <Button onClick={play} title="Play cry">
      {/* The emoji is decoration, so hide it from screen readers; they read the
          sr-only text instead, which sighted users never see. */}
      <span aria-hidden="true">🔊</span>
      <span className="sr-only">Play cry</span>
    </Button>
  );
}
