'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#FAFAFA', color: '#09090B' }}>
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '96px 24px' }}>
          <h1 style={{ fontSize: 32, margin: '0 0 12px' }}>Something went wrong</h1>
          <p style={{ color: '#52525B', margin: '0 0 24px' }}>
            {error.digest ? `Error reference ${error.digest}.` : 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, padding: '0 20px', border: 0, borderRadius: 6, background: '#18181B', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
