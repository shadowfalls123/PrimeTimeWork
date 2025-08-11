import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { Auth } from 'aws-amplify'; // Import the authentication library you are using
import { Hub } from '@aws-amplify/core';

const withAutoLogout = (WrappedComponent) => {
  const AutoLogoutWrapper = (props) => {
    const timeout = 28800000; // Set the timeout duration in milliseconds (e.g., 15 minutes)
    const navigate = useNavigate();
    const [timeoutId, setTimeoutId] = useState(null);

    // Define the logout function
    const logout = async () => {
      try {
        // Perform logout actions
        await Hub.signOut();
        // Redirect to login page
        navigate('/');
      } catch (error) {
        //#PROD logger.log('Error signing out: ', error);
      }
    };

    // Set up the timer for auto logout
    useEffect(() => {
      logger.log("timeout 111 is -->> ", timeout);
      const id = setTimeout(logout, timeout); // Set timeout 
      logger.log("in withAutoLogout id is -->> ", id);
      setTimeoutId(id);

      // Clear the timeout on unmount
      return () => clearTimeout(id);
    }, []);

    // Reset the timeout when there is user activity
    const handleActivity = () => {
      // logger.log("handleActivity 222 is called -- timeout is -->> ", timeout);
      // logger.log("handleActivity 223 is called -- timeoutId is -->> ", timeoutId);      
      clearTimeout(timeoutId);
      // logger.log("handleActivity 224 is called -- timeoutId is -->> ", timeoutId);
      const id = setTimeout(logout, timeout); // Reset timeout
      // logger.log("handleActivity 333 is called -- id is -->> ", id); 
      setTimeoutId(id);
    };

    useEffect(() => {
      logger.log("withAutoLogout useEffect is called ");
      // Add event listeners for user activity
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);

      // Remove event listeners on unmount
      return () => {
        // //Temprarory removing to check if the below 2 lines of code are conflicting with ExamPage EventListner
        // window.removeEventListener('mousemove', handleActivity);
        // window.removeEventListener('keydown', handleActivity);
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  return AutoLogoutWrapper;
};

export default withAutoLogout;
