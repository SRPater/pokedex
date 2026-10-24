import type { ReactNode } from "react";

/** A titled section box. This is the shared look of every card on the detail page. */
export default function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-950">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
