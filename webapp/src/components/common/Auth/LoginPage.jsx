import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
// import { Amplify } from "aws-amplify";
// import awsExports from "../../../aws-exports";
import '@aws-amplify/ui-react/styles.css';
import { createUserProfile } from "../../../services"; // Your service function
import logger from "../../../util/logger";

// // Configure Amplify
// Amplify.configure(awsExports);

const LoginPage = () => {
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);

  const handleUserProfileCreation = async (currentUser) => {
    try {
      logger.log("[LoginPage] - currentUser:", currentUser);
      const email = currentUser.signInDetails?.loginId || "";
      const userFullName = currentUser.username || "";
      const splitName = userFullName.split(" ");
      const firstname = splitName[0] || "";
      const lastname = splitName.slice(1).join(" ");

      if (!profileCreated) {
        const userProfileData = {
          firstname,
          lastname,
          useremail: email,
        };

        await createUserProfile(userProfileData);
        setProfileCreated(true);
      }
    } catch (error) {
      console.error("Error during user profile creation:", error);
    }
  };

  useEffect(() => {
    if (profileCreated) {
      navigate("/");
    }
  }, [profileCreated, navigate]);

  return (
    <div className="LoginPage" style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Welcome to Exams Are Fun</h2>
      <Authenticator
        socialProviders={["google"]}
        loginMechanisms={["email"]}
      >
        {({ user, signOut }) => {
          if (user) {
            logger.log("[LoginPage] - user:", user);
            handleUserProfileCreation(user);
          }

          return (
            <div>
              {user ? (
                <p>Logging you in...</p>
              ) : (
                <p>Please log in or sign up to continue</p>
              )}
              <button onClick={signOut}>Sign Out</button>
            </div>
          );
        }}
      </Authenticator>
    </div>
  );
};

export default LoginPage;
