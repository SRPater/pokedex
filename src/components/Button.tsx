import Link from "next/link";
import type { ReactNode } from "react";

// One look for everything that is styled as a button, so link buttons and
// real buttons can't drift apart.
const STYLES =
  "cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800";

/** A navigation link that looks like a button. */
export function ButtonLink({
  href,
  title = "",
  children,
  className = "",
}: {
  href: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} title={title} className={`${STYLES} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`${STYLES} ${className}`}>
      {children}
    </button>
  );
}
