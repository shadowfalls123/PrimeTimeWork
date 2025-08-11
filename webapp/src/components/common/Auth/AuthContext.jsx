import React, { createContext, useContext, useState, useEffect } from "react";
import { Hub } from "@aws-amplify/core";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import PropTypes from "prop-types";
import logger from "../../../util/logger";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
    try {
      const session = await fetchAuthSession();
      logger.log("[AuthProvider] Session:", session);
      const accessToken = session?.tokens?.accessToken;
      const isSessionValid = accessToken && new Date() < new Date(accessToken.payload.exp * 1000);

      if (!isSessionValid) {
        console.warn("[AuthProvider] Session is invalid or expired.");
        setUser(null);
        setUserRoles([]);
        return;
      }
      const roles = accessToken.payload["cognito:groups"] || [];
      setUserRoles(roles.length ? roles : ["StudentRole"]);

      
      const idToken = session?.tokens?.idToken;
      const userEmail = idToken.payload.email || "";
//      logger.log("[AuthProvider] User email:", userEmail);
      setEmail(userEmail);

      const userName = idToken.payload.name || "";
//      logger.log("[AuthProvider] User name:", userName);
      setUserName(userName);

      const currentUser = await getCurrentUser();
      logger.log("[AuthProvider] Current user:", currentUser);
      setUser(currentUser);
    } catch (error) {
      setUser(null);
      setUserRoles([]);
      console.error("[AuthProvider] Error:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    const unsubscribe = Hub.listen("auth", ({ payload: { event } }) => {
      if (event === "signedIn" || event === "signedOut") {
        checkUser();
      }
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, userRoles, checkUser, email, userName }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
