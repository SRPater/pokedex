import Link from "next/link";
import type { ReactNode } from "react";

/** A link styled as a bordered button, like the pagination buttons. */
export default function ButtonLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border border-gray-200 b-gray-50 px-4 py-2 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 ${className}`}
    >
      {children}
    </Link>
  );
}
