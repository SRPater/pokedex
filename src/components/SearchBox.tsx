"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Search field above the list. Typing updates ?q= aftera pause. The text is
 * local state, so it is never overwritten while you type; it only follows the
 * URL when the URL changed for another reason (back button, "Show all Pokémon").
 */
export default function SearchBox({ initialQuery }: { initialQuery: string }) {
  const [text, setText] = useState(initialQuery);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The query this box last put in the URL itself, to tell our own URL changes
  // from external ones.
  const lastPushed = useRef(initialQuery);

  useEffect(() => {
    if (initialQuery !== lastPushed.current) {
      // External change: drop any pending search of ours, and show the new query.
      clearTimeout(timer.current);
      lastPushed.current = initialQuery;
      setText(initialQuery);
    }
  }, [initialQuery]);

  function handleChange(value: string) {
    setText(value);

    // Wait until the visitor pauses before changing the URL: each new keystroke
    // cancels the previous timer.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const query = value.trim();
      lastPushed.current = query;
      // replace, not push: otherwise the back button would step through every
      // search. A new search starts on page 1, so the page number is dropped.
      router.replace(
        query ? `/pokemon?${new URLSearchParams({ q: query }).toString()}` : "/pokemon",
      );
    }, 300);
  }

  return (
    <div className="relative">
      <input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search Pokémon"
        aria-label="Search Pokémon"
        className="w-full rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 pl-4 pr-12 py-2 dark:border-gray-700 dark:bg-[#0a0a0a] dark:focus:ring-gray-500 placeholder:text-gray-500"
      />
      {/* Decorative: the input has its own aria-label, so screen readers skip this.
          pointer-events-none lets clicks go through to the input underneath. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
    </div>
  );
}
