"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: '#dc2626' }}>Something went wrong (Login)</h1>
      <p>{error.message}</p>
      <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Try again</button>
    </div>
  );
}
