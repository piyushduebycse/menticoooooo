import React from 'react';
import { AlertTriangle, RotateCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Mentico ErrorBoundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error || 'Unexpected rendering error');

      return (
        <div
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            backgroundColor: 'var(--bg-base, #FFFFFF)',
            color: 'var(--text-main, #111827)',
            fontFamily: 'var(--font-body, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--bg-surface, #F9FAFB)',
              border: '1px solid var(--border-main, #E5E7EB)',
              borderRadius: 'var(--radius-md, 10px)',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card, 0 10px 30px rgba(0,0,0,0.06))',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: 'var(--red-primary, #DC2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '1.4rem',
                fontWeight: 800,
                marginBottom: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
              }}
            >
              Something Went Wrong
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #4B5563)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              We encountered an issue loading this section. Your account and purchase credentials remain secure.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                <RotateCw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                }}
              >
                <Home size={15} />
                <span>Back to Home</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <details
                style={{
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: 'var(--bg-card, #FFFFFF)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-subtle, #F3F4F6)',
                  color: 'var(--text-muted, #6B7280)',
                  overflowX: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--red-primary, #DC2626)' }}>
                  Technical Details (Debug)
                </summary>
                <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {errorMessage}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
