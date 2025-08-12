import React, { useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { AppLayout, ExamLayout, AuthLayout } from "./components/layout";
import { ThemeProvider } from "./theme/ThemeProvider";
import CMERoutes from "./components/common/CMERoutes";
import ScrollToTop from "./components/common/ScrollToTop";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useLocation } from "react-router-dom";

// Type definitions
interface HelmetContext {
  helmet?: {
    title?: { toString(): string };
    meta?: { toString(): string };
    link?: { toString(): string };
  };
}

const helmetContext: HelmetContext = {};
Amplify.configure(awsconfig);

const handleGlobalError = (
  message: string | Event,
  source?: string,
  line?: number,
  column?: number,
  error?: Error
): boolean => {
  console.error('Global error:', error || message);
  return false;
};

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.onerror = handleGlobalError;
    
    // Cleanup function
    return () => {
      window.onerror = null;
    };
  }, []);

  // Check if the current route is an exam page
  const isExamPage = location.pathname.startsWith("/exam");
  const isAuthPage = ["/login", "/logout", "/callback"].includes(location.pathname);

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet titleTemplate="%s | PrimeTime" defaultTitle="PrimeTime Learning" />
      <ThemeProvider>
        <ErrorBoundary>
          <ScrollToTop />
          {isExamPage ? (
            <ExamLayout>
              <CMERoutes />
            </ExamLayout>
          ) : isAuthPage ? (
            <CMERoutes />
          ) : (
            <AppLayout>
              <CMERoutes />
            </AppLayout>
          )}
        </ErrorBoundary>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
