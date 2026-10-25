import type { ReactNode } from "react";

/** Centered title and explanation with optional actions, for 404 and error pages. */
export default function StatusMessage({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-8 py-24 text-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-gray-500">{message}</p>
      {children && <div className="mt-8 flex gap-4">{children}</div>}
    </div>
  );
}
