import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
//import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
//import { AmplifyAuthenticator, AmplifySignIn, AmplifySignUp } from '@aws-amplify/ui-components';
import '@aws-amplify/ui-react/styles.css';
//import { checkUser } from '../src/components/Header';

//import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';
//import { Auth } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { createUserProfile } from "../../../services";

function LoginPage() {
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);
  const [mounted, setMounted] = useState(true);


  const handleAuthStateChange = (nextAuthState) => {  
    // setAuthState(nextAuthState);
    //Added to remove the lint error message
    if(nextAuthState === "DummysignedIn"){
      console.log("In handleAuthStateChange nextAuthState is -> ", nextAuthState);
    }
  };

  onAuthUIStateChange(handleAuthStateChange);

  const handleUserProfileCreation = async () => {
    try {
      //#PROD console.log("In handleUserProfileCreation 1 ");
      const user = await Hub.currentAuthenticatedUser();
      //#PROD console.log("In handleUserProfileCreation 1 User -->> ", user);
      const email = user.attributes.email;
      //#PROD console.log("In handleUserProfileCreation 1 Email -->> ", email);
      const userFullName = user.attributes.name || user.username;
      //#PROD console.log("In handleUserProfileCreation 1 userFullName -->> ", userFullName);

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
      //#PROD console.log("Error during user profile creation:", error);
      // Handle errors or redirect to appropriate pages
    }
  };

  useEffect(() => {
    //#PROD console.log("In useEffect [] ");
    onAuthUIStateChange(handleAuthStateChange);

    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    //#PROD console.log("In useEffect [profileCreated, mounted] ");
    handleUserProfileCreation();

    return () => {
      // Cleanup function to cancel any pending async tasks
      // You can add cleanup code related to user profile creation here if necessary
    };
  }, [profileCreated, mounted]);

  return (
      <div className="LoginPage" style={{ textAlign: 'center', marginTop: '1px' }}>
      <h2>Welcome to Exams Are Fun</h2>
    {/* <Authenticator socialProviders={['amazon', 'apple', 'facebook', 'google']} > */}
    <Authenticator socialProviders={['google']} >

    {/* <Authenticator socialProviders={['amazon', 'apple', 'facebook', 'google']} hideSignUp={true}> */}

    {({ user }) => {  
          if (user) {
            //#PROD console.log("user in LoginPage is -->> ", user);
            handleUserProfileCreation();
             navigate("/");
            }
      }}
    </Authenticator>
    </div>
  );
}

export default LoginPage;