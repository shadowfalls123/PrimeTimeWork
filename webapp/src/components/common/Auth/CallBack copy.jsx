import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
//import { Auth } from 'aws-amplify';
import { Hub } from '@aws-amplify/core';
import { createUserProfile } from "../../../services";

function CallBack() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);
  const [mounted, setMounted] = useState(true);


  const handleUserAuthentication = async () => {
    try {
      await Hub.currentAuthenticatedUser();
      //const user = await Hub.currentAuthenticatedUser();
      //#PROD console.log("In Callback handleUserAuthentication -- User is already authenticated:", user);
      navigate("/");
    } catch (error) {
      //#PROD console.log("User is not authenticated. Proceeding with callback handling.");
      handleCallback();
    }
  };

  const handleCallback = async () => {
    if (location.pathname === "/callback") {
      try {
        await Hub.federatedSignIn({ provider: "Google" });
        navigate("/");
      } catch (error) {
        //#PROD console.log("Error during Cognito callback:", error);
      }
    }
  };

  const createProfile = async () => {
    try {
      console.log("[Callback createProfile 1]")
      const user = await Hub.currentAuthenticatedUser();
      console.log("[Callback createProfile 2] -- User is already authenticated:", user);
  
      const email = user.signInUserSession.idToken.payload.email;
      const userFullName = user.signInUserSession.idToken.payload.name;
  
      const splitName = userFullName.split(' ');
      const firstname = splitName[0] || '';
      const lastname = splitName.slice(1).join(' ');
  
      if (mounted && !profileCreated) {
        const userProfileData = {
          firstname: firstname,
          lastname: lastname,
          useremail: email,
          // Add other necessary data for the user profile
        };
  
        // Check if the component is still mounted before proceeding
        if (mounted) {
          await createUserProfile(userProfileData);
          //const response = await createUserProfile(userProfileData);
          //#PROD console.log('User profile created:', response);
  
          // Set profileCreated only if the component is still mounted
          if (mounted) {
            setProfileCreated(true);
          }
        }
      }
    } catch (error) {
      //#PROD console.log("Error:", error);
      // Handle errors or redirect to appropriate pages
    }
  };
  
  // const createProfile = async () => {
  //   try {
  //     const user = await Hub.currentAuthenticatedUser();
  //     //#PROD console.log("User is already authenticated:", user);

  //     const email = user.signInUserSession.idToken.payload.email;
  //     const userFullName = user.signInUserSession.idToken.payload.name;

  //     const splitName = userFullName.split(' ');
  //     const firstname = splitName[0] || '';
  //     const lastname = splitName.slice(1).join(' ');

  //     if (!profileCreated) {
  //       const userProfileData = {
  //         firstname: firstname,
  //         lastname: lastname,
  //         useremail: email,
  //         // Add other necessary data for the user profile
  //       };

  //       const response = await createUserProfile(userProfileData);
  //       //#PROD console.log('User profile created:', response);

  //       setProfileCreated(true);
  //     }
  //   } catch (error) {
  //     //#PROD console.log("Error:", error);
  //     // Handle errors or redirect to appropriate pages
  //   }
  // };

  useEffect(() => {
    handleUserAuthentication();
    
    return () => {
      // Cleanup function to set mounted to false when component unmounts
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    createProfile();
    return () => {
      // Cleanup function to cancel any pending async tasks
      // You can add cleanup code related to createProfile here if necessary
    };
  }, [profileCreated, mounted]);

  return (
      <div className="LoginPage" style={{ textAlign: 'center', marginTop: '1px' }}>
      <h2>Welcome to Exams Are Fun</h2>
    </div>
  );
}

export default CallBack;
