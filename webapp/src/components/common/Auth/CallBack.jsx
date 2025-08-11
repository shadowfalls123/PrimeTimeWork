import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Hub } from "@aws-amplify/core";
import { createUserProfile } from "../../../services";
import logger from "../../../util/logger";

function CallBack() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkUser, email, userName } = useAuth();
  const [profileCreated, setProfileCreated] = useState(false);
  const [mounted, setMounted] = useState(true);

  // Handle user authentication and callback logic
  const handleUserAuthentication = async () => {
    try {
      await checkUser(); // Use the centralized auth logic from AuthContext
      navigate("/"); // Redirect to the home or dashboard
    } catch (error) {
      console.error("Error during user authentication:", error);
      handleCallback();
    }
  };

  const handleCallback = async () => {
    if (location.pathname === "/callback") {
      try {
        await Hub.federatedSignIn({ provider: "Google" }); // Federated sign-in
        await checkUser(); // Check user session after federated sign-in
        navigate("/"); // Redirect after successful login
      } catch (error) {
        console.error("Error during callback handling:", error);
      }
    }
  };

  // Create user profile if not already created
  const createProfile = async () => {
    try {
      logger.log("[Callback ]Creating profile for user - email -->> :", email);
//      const user = await Hub.currentAuthenticatedUser(); // Get current user
//      const email = user.signInUserSession.idToken.payload.email;
//      const userFullName = user.signInUserSession.idToken.payload.name;
      const userFullName = userName; 
      const splitName = userFullName.split(" ");
      const firstname = splitName[0] || "";
      const lastname = splitName.slice(1).join(" ");

      if (mounted && !profileCreated) {
        const userProfileData = {
          firstname,
          lastname,
          useremail: email,
          // Add other necessary profile data here
        };

        await createUserProfile(userProfileData); // Call service to create profile
        if (mounted) {
          setProfileCreated(true); // Update state only if component is mounted
        }
      }
    } catch (error) {
      console.error("Error during profile creation:", error);
      // Handle error or redirect as necessary
    }
  };

  useEffect(() => {
    handleUserAuthentication(); // Trigger authentication on component mount

    return () => {
      setMounted(false); // Cleanup to avoid state updates on unmounted component
    };
  }, []);

  useEffect(() => {
    if (!profileCreated) {
      createProfile(); // Trigger profile creation if not created
    }
  }, [profileCreated]);

  return (
    <div className="LoginPage" style={{ textAlign: "center", marginTop: "1px" }}>
      <h2>Welcome to Exams Are Fun</h2>
    </div>
  );
}

export default CallBack;
