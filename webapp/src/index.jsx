import React from "react";
//import ReactDOM from "react-dom";
import ReactDOM from "react-dom/client"; // Use createRoot from react-dom/client
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme";
import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import store from "./store";
import {AuthProvider} from "./components/common/Auth/AuthContext";
//import withAutoLogout from "./withAutoLogout"; // Import the withAutoLogout HOC

// Wrap the App component with the withAutoLogout Higher Order Component (HOC)
//const AppWithAutoLogout = withAutoLogout(App);

const rootElement = document.getElementById("root");

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            {/* <AppWithAutoLogout /> */}
            <AuthProvider>
              <App />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  // document.getElementById("root")
);

// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root'),
// );
