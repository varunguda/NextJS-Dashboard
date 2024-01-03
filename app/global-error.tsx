'use client';

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => props.reset()}>Try again</button>
      </body>
    </html>
  );
}
