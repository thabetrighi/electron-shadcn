import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import i18n from "./localization/i18n";
import { updateAppLanguage } from "./helpers/language_helpers";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { SettingsCacheManager } from "./helpers/settings-cache";
import { Direction } from "radix-ui";
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
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            margin: "20px",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ color: "#c33" }}>Something went wrong!</h2>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007cba",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
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
  const { i18n: i18nHook } = useTranslation();
  const [appReady, setAppReady] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);
  const [initProgress, setInitProgress] =
    React.useState<string>("Initializing...");

  // Initialize app with proper error handling and progress tracking
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🚀 Starting app initialization...");
        setInitProgress("Waiting for database...");

        // Wait for database to be ready
        let dbRetries = 0;
        const maxDbRetries = 20;

        while (!window.database && dbRetries < maxDbRetries) {
          console.log(
            `Waiting for database to be ready... (attempt ${dbRetries + 1}/${maxDbRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 250));
          dbRetries++;
        }

        if (!window.database) {
          throw new Error("Database not available after maximum retries");
        }

        setInitProgress("Loading settings cache...");

        // Initialize settings cache first
        await SettingsCacheManager.initialize();

        setInitProgress("Initializing theme...");
        // Initialize theme
        syncThemeWithLocal();

        setInitProgress("Loading language settings...");
        // Update language from storage
        const langResult = await updateAppLanguage(i18nHook);
        console.log("Language updated from storage:", langResult);

        setInitProgress("Setting up language listeners...");
        // Add language change listener
        const handleLanguageChange = () => {
          console.log("Language changed, updating app...");
          document.documentElement.lang = i18nHook.language;
          document.documentElement.dir = i18nHook.dir();
          if (i18nHook.language === "ar") {
            document.documentElement.classList.add("rtl");
          } else {
            document.documentElement.classList.remove("rtl");
          }
          // Dispatch custom event for components
          window.dispatchEvent(
            new CustomEvent("languageChanged", {
              detail: { language: i18nHook.language },
            }),
          );
        };

        // Apply initial language settings
        handleLanguageChange();

        i18nHook.on("languageChanged", handleLanguageChange);
        console.log("Language change listener added");

        setInitProgress("Finalizing initialization...");

        // Apply initial settings from cache
        const applyInitialSettings = () => {
          try {
            // Apply theme mode
            const themeMode =
              SettingsCacheManager.get("theme_mode") || "system";
            if (themeMode !== "system") {
              document.documentElement.classList.remove("light", "dark");
              document.documentElement.classList.add(themeMode);
            }

            // Apply font size
            const fontSize = SettingsCacheManager.get("font_size") || "medium";
            const fontSizes = { small: "14px", medium: "16px", large: "18px" };
            const newFontSize =
              fontSizes[fontSize as keyof typeof fontSizes] || "16px";
            document.documentElement.style.fontSize = newFontSize;

            // Apply compact mode
            const compactMode =
              SettingsCacheManager.get("compact_mode") || "false";
            if (compactMode === "true") {
              document.documentElement.classList.add("compact-mode");
              document.documentElement.style.setProperty(
                "--spacing-scale",
                "0.75",
              );
            }

            // Apply sidebar position
            const sidebarPosition =
              SettingsCacheManager.get("sidebar_position") || "left";
            document.documentElement.style.setProperty(
              "--sidebar-position",
              sidebarPosition,
            );
            document.documentElement.setAttribute(
              "data-sidebar-position",
              sidebarPosition,
            );

            // Apply currency settings
            const currencySymbol =
              SettingsCacheManager.get("currency_symbol") || "دج";
            const currencyPosition =
              SettingsCacheManager.get("currency_position") || "before";
            const currencyDecimals =
              SettingsCacheManager.get("decimal_places") || "2";
            const currencyCode =
              SettingsCacheManager.get("currency_code") || "DZD";

            document.documentElement.style.setProperty(
              "--currency-symbol",
              currencySymbol,
            );
            document.documentElement.style.setProperty(
              "--currency-position",
              currencyPosition,
            );
            document.documentElement.style.setProperty(
              "--currency-decimals",
              currencyDecimals,
            );
            document.documentElement.style.setProperty(
              "--currency-code",
              currencyCode,
            );

            console.log("✅ Initial settings applied from cache");
          } catch (error) {
            console.warn("⚠️ Error applying initial settings:", error);
          }
        };

        applyInitialSettings();

        console.log("✅ App initialization completed successfully");
        setAppReady(true);

        return () => {
          i18nHook.off("languageChanged", handleLanguageChange);
        };
      } catch (error) {
        console.error("❌ Error during app initialization:", error);
        setInitError(error instanceof Error ? error.message : "Unknown error");
        // Still set app as ready to show error state
        setAppReady(true);
      }
    };

    initializeApp();
  }, [i18nHook]);

  console.log("App component rendering, appReady:", appReady);

  if (!appReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ marginBottom: "20px", fontSize: "18px" }}>
          Loading POS System...
        </div>
        <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>
          {initProgress}
        </div>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
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
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          margin: "20px",
          borderRadius: "8px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2 style={{ color: "#856404", marginTop: 0 }}>
          Initialization Warning
        </h2>
        <p>The app started with some issues: {initError}</p>
        <p>The application will continue to work with limited functionality.</p>
        <button
          onClick={() => setInitError(null)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007cba",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <Direction.Provider dir={i18nHook.dir()}>
      <ErrorBoundary>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </ErrorBoundary>
    </Direction.Provider>
  );
}

const root = createRoot(document.getElementById("app")!);
console.log("Creating root and rendering app");
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
