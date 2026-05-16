'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0f',
            color: 'white',
            fontFamily: 'system-ui',
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>致命错误</h1>
            <p style={{ marginBottom: '1.5rem', color: '#a1a1aa' }}>
              应用遇到了严重错误。
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#71717a',
                  marginBottom: '1rem',
                  fontFamily: 'monospace',
                }}
              >
                错误编号: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#4f8fff',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
