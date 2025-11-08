import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.errorBox}>
            <h2 style={styles.title}>⚠️ Something went wrong</h2>
            <p style={styles.message}>
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error details</summary>
                <pre style={styles.stackTrace}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  errorBox: {
    background: 'white',
    borderRadius: '10px',
    padding: '40px',
    maxWidth: '600px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  },
  title: {
    color: '#d32f2f',
    fontSize: '24px',
    margin: '0 0 15px 0'
  },
  message: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '20px',
    lineHeight: '1.6'
  },
  details: {
    marginBottom: '20px',
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '5px'
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#667eea',
    userSelect: 'none'
  },
  stackTrace: {
    marginTop: '10px',
    padding: '10px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '3px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '200px',
    color: '#d32f2f'
  },
  button: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'transform 0.3s ease',
    marginTop: '10px'
  }
};

export default ErrorBoundary;
