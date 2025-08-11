import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Box, Grid, useMediaQuery } from "@mui/material";
import Header from "./components/common/homepage/Header";
import Footer from "./components/common/homepage/Footer";
import CMERoutes from "./components/common/CMERoutes";
import MenuPanel from "./components/common/homepage/MenuPanel";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useLocation } from "react-router-dom";

const helmetContext = {};
Amplify.configure(awsconfig);

const handleGlobalError = (message, source, line, column, error) => {
  console.error(error);
  return false;
};

function App() {
  const [isMenuCollapsed, setMenuCollapsed] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm")); // Check for mobile layout
  const location = useLocation(); // Get the current route

  useEffect(() => {
    window.onerror = handleGlobalError;
  }, []);

  const toggleMenu = () => {
    setMenuCollapsed(!isMenuCollapsed);
  };

    // Check if the current route is "/exam"
    const isExamPage = location.pathname === "/exam";

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet titleTemplate="%s | KodingHut" defaultTitle="Exams Are Fun" />
      <ErrorBoundary>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Header at the top */}
          {/* Render Header only if not on the ExamPage */}
          {!isExamPage && <Header />}

          <Grid container sx={{ height: "100%", flex: 1, display: "flex", flexDirection: "row" }}>
            {/* Sidebar for Menu on the left */}
            {/* Render MenuPanel only if not on the ExamPage */}
            {!isExamPage && !isMobile && (
              <Grid item sx={{ width: isMenuCollapsed ? "60px" : "240px", backgroundColor: "#0070C0", color: "#fff", transition: "width 0.3s" }}>
                {/* Use the MenuPanel here */}
                <MenuPanel isMenuCollapsed={isMenuCollapsed} toggleMenu={toggleMenu} />
              </Grid>
            )}

            {/* Main content area */}
            <Grid item sx={{ flex: 1, padding: "16px" }}>
              <CMERoutes />
            </Grid>
          </Grid>

          {/* Footer at the bottom */}
          {/* Render Footer only if not on the ExamPage */}
          {!isExamPage && (
            <Box sx={{ marginTop: "auto" }}>
              <Footer />
            </Box>
          )}
        </Box>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
