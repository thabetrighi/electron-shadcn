import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#c33' }}>Something went wrong!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const { i18n } = useTranslation();
  const [appReady, setAppReady] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  useEffect(() => {
    console.log('App component mounted');
    
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Initialize theme
        syncThemeWithLocal();
        console.log('Theme initialized');
        
        // Initialize language
        updateAppLanguage(i18n);
        console.log('Language initialized');
        
        // Database is initialized in the main process, not here
        // The renderer process should use IPC to communicate with the database
        console.log('Database initialization handled by main process');
        
        console.log('App initialization completed');
        setAppReady(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        // Still set app as ready to show error state
        setAppReady(true);
      }
    };

    initializeApp();
  }, [i18n]);

  console.log('App component rendering, appReady:', appReady);

  if (!appReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ marginBottom: '20px', fontSize: '18px' }}>Loading POS System...</div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        margin: '20px',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h2 style={{ color: '#856404', marginTop: 0 }}>Initialization Warning</h2>
        <p>The app started with some issues: {initError}</p>
        <p>The application will continue to work with limited functionality.</p>
        <button 
          onClick={() => setInitError(null)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </ErrorBoundary>
  );
}

const root = createRoot(document.getElementById("app")!);
console.log('Creating root and rendering app');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
