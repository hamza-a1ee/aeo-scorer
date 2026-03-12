'use client';

import { RefreshCw } from 'lucide-react';
import Image from 'next/image';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorCode = error.digest ?? 'UNKNOWN_ERROR';

  return (
    <html lang="en">
      <body
        className="min-h-dvh w-full bg-neutral-gray-0 flex flex-col items-center justify-center p-6 font-uncut-sans antialiased"
        style={{ fontFamily: 'var(--font-uncut-sans)' }}
      >
        <div className="flex flex-col items-center gap-8 max-w-md w-full">
          <Image
            src="/asset/somethig.svg"
            alt="something"
            width={120}
            height={48}
            className="shrink-0"
          />
          <div className="w-full rounded-2xl bg-white p-8 shadow-lg flex flex-col items-center text-center gap-5">
            <h1 className="text-3xl font-bold text-neutral-gray-80 tracking-tight">
              Uh{' '}
              <span className="inline-block border-b-4 border-primary pb-0.5">
                Oh
              </span>
            </h1>
            <p className="text-xl font-semibold text-neutral-gray-80">
              Something went wrong
            </p>
            <p className="text-sm text-neutral-gray-50 leading-relaxed">
              We&apos;re sorry, something unexpected happened. Try refreshing
              the page. If the problem persists, please contact support.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-light-orange bg-light-orange/30 px-3 py-1.5 text-xs">
              <span className="text-neutral-gray-50">Error code:</span>
              <span className="font-medium text-primary">{errorCode}</span>
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="h-5 w-5 shrink-0" aria-hidden />
              Try again
            </button>
          </div>
          <p className="text-sm text-neutral-gray-50">
            Need help?{' '}
            <a
              href="mailto:support@some.com"
              className="font-semibold text-primary hover:underline"
            >
              Contact support
            </a>
          </p>s
        </div>
      </body>
    </html>
  );
}
