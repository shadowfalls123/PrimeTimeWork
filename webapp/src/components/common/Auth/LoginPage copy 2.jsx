import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import {
  getCurrentUser,
  // confirmSignIn,
  // confirmSignUp,
  // signIn,
  // signOut,
  // signUp,
} from "@aws-amplify/auth"; // Import required methods from @aws-amplify/auth
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "../../../aws-exports";
import { createUserProfile } from "../../../services"; // Your service function

// Configure Amplify
Amplify.configure(awsExports);



const LoginPage = () => {
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    if (profileCreated) {
      navigate("/");
    }
  }, [profileCreated, navigate]);

  const handleUserProfileCreation = async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log("Full user object:", currentUser);

      // const email = currentUser.attributes.email; // Fetch email
      // const userFullName = currentUser.attributes.name || currentUser.username;

          // Extract email and username
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

  return (
    <div className="LoginPage" style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Welcome to Exams Are Fun</h2>
      <Authenticator
        socialProviders={["google"]}
        loginMechanisms={["email"]}
      >
        {({ user, signOut }) => {
          if (user) {
            handleUserProfileCreation();
//            navigate("/");
          }

          return (
            <div>
              <p>Please log in or sign up to continue</p>
              <button onClick={signOut}>Sign Out</button>
            </div>
          );
        }}
      </Authenticator>
    </div>
  );
};

export default LoginPage;
