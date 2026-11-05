"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { listHref } from "@/lib/list-url";
import {
  parseSort,
  SORT_LABELS,
  SORT_OPTIONS,
  type SortOption,
} from "@/lib/sort";

// Shared by the field and the dropdown, so the two look the same.
const FIELD_STYLES =
  "rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 px-4 py-2 dark:border-gray-700 dark:bg-[#0a0a0a] dark:focus:ring-gray-500";

/**
 * Search field and sort dropdown above the list. Both write to the URL (?q= and
 * ?sort=), keep each other's value and start on page 1. Typing waits for a pause
 * before it changes the URL; choosing a sort does it at once. The text and the
 * sort are local state, so they are never overwritten while you use them; they
 * only follow the URL when it changed for another reason (back button,
 * "Show all Pokémon").
 */
export default function ListControls({
  initialQuery,
  initialSort,
}: {
  initialQuery: string;
  initialSort: SortOption;
}) {
  const [text, setText] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The query and sort this copmonent last put in the URL itself: it tells our
  // own URL changes from external ones, and it's the sort a delayed search uses.
  const lastPushed = useRef({ query: initialQuery, sort: initialSort });

  useEffect(() => {
    const last = lastPushed.current;
    if (initialQuery !== last.query || initialSort !== last.sort) {
      // External change: drop any pending search of ours, and show the new values.
      clearTimeout(timer.current);
      lastPushed.current = { query: initialQuery, sort: initialSort };
      setText(initialQuery);
      setSort(initialSort);
    }
  }, [initialQuery, initialSort]);

  function navigate(query: string, newSort: SortOption) {
    clearTimeout(timer.current);
    lastPushed.current = { query, sort: newSort };
    // replace, not push: otherwise the back button would step through every
    // search. A new search or sort starts on page 1, so the page number is dropped.
    router.replace(listHref({ query, sort: newSort, page: 1 }));
  }

  function handleChange(value: string) {
    setText(value);

    // Wait until the visitor pauses before changing the URL: each new keystroke
    // cancels the previous timer.
    clearTimeout(timer.current);
    timer.current = setTimeout(
      () => navigate(value.trim(), lastPushed.current.sort),
      300,
    );
  }

  function handleSort(value: string) {
    const newSort = parseSort(value);
    setSort(newSort);
    // Uses the text as typed so far, and cancels a search that was still waiting.
    navigate(text.trim(), newSort);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <input
          type="search"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Search Pokémon"
          aria-label="Search Pokémon"
          className={`${FIELD_STYLES} w-full pr-12 placeholder:text-gray-500`}
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
      <select
        value={sort}
        onChange={(event) => handleSort(event.target.value)}
        aria-label="Sort by"
        className={`${FIELD_STYLES} cursor-pointer`}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
