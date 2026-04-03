import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('Error caught:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', backgroundColor: '#1e293b', color: '#ef4444', borderRadius: '8px', textAlign: 'center', margin: '20px' }}>
                    <h2>Something went wrong</h2>
                    <p>Please refresh the page to try again.</p>
                    <details style={{ textAlign: 'left', marginTop: '20px' }}>
                        <summary>Error Details</summary>
                        <pre style={{ color: '#94a3b8', fontSize: '12px' }}>{this.state.error?.toString()}</pre>
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);