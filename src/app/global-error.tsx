"use client";

import "./globals.css";

// Last-resort page for crashes in the root layout itself, which error.tsx can't
// catch. It replaces the alyout, so it needs its own <html> and <body>, and it
// imports the global CSS because the layout's import isn't loaded here.
export default function GlobalError() {
  return(
    <html lang="en">
      <body className="flex min-h-full flex-col items-center justify-center px-8 py-24 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-4 text-gray-500">
          The app hit an unexpected error. Please reload the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 hover:bg-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800">
            Reload
          </button>
      </body>
    </html>
  );
}
