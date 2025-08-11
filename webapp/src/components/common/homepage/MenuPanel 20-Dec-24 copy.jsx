import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemText, MenuItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate } from "react-router-dom";
//import { Auth, Hub } from "aws-amplify";
// import { Hub } from '@aws-amplify/core';
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
//import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
//import { checkSession } from "../../../util/fetchUserSession.js";
// import { checkIfUserLoggedIn } from "../../../util/userAuthUtils.js"
import { Hub } from '@aws-amplify/core';
import { signOut } from "aws-amplify/auth";
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
// import * as Amplify from 'aws-amplify';
// const { Auth } = Amplify;


function MenuPanel({ isMenuCollapsed, toggleMenu }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSubmenu2Open, setSubmenu2Open] = useState(false);
  const [userRoles, setUserRoles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  // const userRoles =
  //   user?.signInUserSession.accessToken.payload["cognito:groups"];
  
  useEffect(() => {
    const calculateMenuItems = () => {
      console.log("calculateMenuItems 1.1");
      console.log("calculateMenuItems 1.2", user);
      console.log("calculateMenuItems 1.3", userRoles);
      console.log("calculateMenuItems 1.4");
      if (!user) {
        console.log("calculateMenuItems 2");
        setMenuItems(loginMenuItems); // Guest menu
      } else if (userRoles?.includes("admin")) {
        console.log("calculateMenuItems 3");
        setMenuItems([...adminMenuItems]); // Admin menu
      } else if (userRoles?.includes("tutor")) {
        console.log("calculateMenuItems 4");
        setMenuItems([...commonMenuItems, ...tutorMenuItems]); // Tutor menu
      } else {
        setMenuItems([...commonMenuItems]); // Default menu for logged-in users
      }
    };
  
    calculateMenuItems();
  }, [user, userRoles]);
  
  // useEffect(() => {
  //   const calculateMenuItems = () => {
  //     if (user) {
  //       if (userRoles.includes("admin")) {
  //         setMenuItems([...adminMenuItems]);
  //       } else {
  //         setMenuItems([...commonMenuItems]);
  //       }
  //     } else {
  //       setMenuItems(loginMenuItems);
  //     }
  //   };
  
  //   calculateMenuItems();
  // }, [user, userRoles]);

  const toggleSubmenu2 = () => {
    setSubmenu2Open(!isSubmenu2Open);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await checkUser();
        await checkUserSession();
      } catch (error) {
        console.error("Error during user/session check:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  
        // Subscribe to Hub Auth events
        const unsubscribe = Hub.listen("auth", handleAuthEvent);

//    const listener = Hub.listen("auth", handleAuthEvent);
    return () => {
            // Unsubscribe from Hub Auth events
            unsubscribe();
          // Use Hub.remove to clean up the listener
        //  Hub.remove("auth", handleAuthEvent);
//      listener(); // Cleanup the listener
    };
  }, []);

  // useEffect(async() => {
  //   setIsLoading(true);
  //   await checkUser();
  //   await checkUserSession();
  //   setIsLoading(false);
  //   const listener = Hub.listen("auth", handleAuthEvent);

  //   return () => {
  //     listener();
  //   };
  // }, []);

  const handleAuthEvent = async ({ payload }) => {
    console.log("Auth Event Payload:", payload);

    const { event } = payload;
    if (event === "signedIn" || event === "signedOut") {
      checkUserSession();
    }
  };

  const checkUserSession = async () => {
    try {
//      const session = await checkSession();
      const session = await fetchAuthSession();
      if (session) {
        const { accessToken } = session.tokens ?? {};
        console.log("accessToken -->> ", accessToken);
        

        // const loggedInUser =  await checkIfUserLoggedIn();
        // console.log("loggedInUser -->> ", loggedInUser);
        // setUser(loggedInUser);

        const roles = accessToken?.payload["cognito:groups"] || [];
        if (roles.length === 0) {
          console.warn("No roles found for the user. Assigning default roles or restricting access.");
          setUserRoles("Default Role");  
      } else {
        console.log("user belongs to following groups: " + roles);
        setUserRoles(roles);
      }
      } else {
        setUser(null);
        setUserRoles(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
      setUserRoles(null);
    } 
    // finally {
    //   setIsLoading(false); // Ensure loading is false after the check
    // }
  };

  // useEffect(() => {
  //   checkUser();
  //   Hub.listen("auth", handleAuthEvent);

  //   return () => {
  //     Hub.remove("auth", handleAuthEvent);
  //   };
  // }, []);

  // const handleAuthEvent = ({ payload: { event } }) => {
  //   if (event === "signedIn" || event === "signedOut") {
  //     checkUser();
  //   }
  // };

  const checkUser = async () => {
    try {
//      const userData = await Hub.currentAuthenticatedUser();
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error checking userData:", error);
      setUser(null);
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  // function handleCatchGame() {
  //   // Handle menu 1 item click event
  //   navigate("/catchgame");
  // }

  // function handleChessGame() {
  //   navigate("/chess");
  // }
  
  const handleContactUs = () => {
    navigate("/contact");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      // await Hub.signOut();
      await signOut();
      // checkUser();
      checkUserSession();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  function handleProfileClick() {
    navigate("/profile");
  }

  // function handleMyCourseClick() {
  //   navigate("/mycourses");
  // }

  function handleMyLearningsClick() {
    navigate("/mylearnings");
  }

  function handleDashhboardClick() {
    navigate("/dashboard");
  }

  function handleCreateExam() {
    navigate("/createexam");
  }

  function handleCreatePackage() {
    navigate("/createpackage");
  }

  function handleMyPapers() {
    navigate("/submittedpapers");
  }
  
  function handleMyPacks() {
    navigate("/mypacks");
  }

  const commonMenuItems = [
    <MenuItem key="profile" onClick={handleProfileClick}>
      My Account
    </MenuItem>,
    // <MenuItem key="my-courses" onClick={handleMyCourseClick}>
    //   My Courses
    // </MenuItem>,
    <MenuItem key="my-learnings" onClick={handleMyLearningsClick}>
      My Learnings
    </MenuItem>,
    <MenuItem key="dashboard" onClick={handleDashhboardClick}>
      Dashboard
    </MenuItem>,
    <ListItem button onClick={handleContactUs} key="contact-us">
      <ListItemText primary="Contact Us" />
    </ListItem>,
  ];

  const loginMenuItems = [
    // <MenuItem key="catchgame" onClick={handleCatchGame}>
    //     Have Fun
    // </MenuItem>,
    //     <MenuItem key="chess" onClick={handleChessGame}>
    //     Chess
    // </MenuItem>,     
    <MenuItem key="profile" onClick={handleLogin}>
      Login
    </MenuItem>,
  ];

  const logoutMenuItems = [
    <MenuItem key="logout" onClick={handleLogout}>
      Logout
    </MenuItem>,
  ];

  const tutorMenuItems =
    userRoles && userRoles.includes("tutor")
      ? [
          <MenuItem key="my-papers" onClick={handleMyPapers}>
            My Papers
          </MenuItem>,
          <MenuItem key="my-packs" onClick={handleMyPacks}>
            My Packs
          </MenuItem>,
          <MenuItem key="create-exam" onClick={handleCreateExam}>
            Create Exam
          </MenuItem>,
          <MenuItem key="create-package" onClick={handleCreatePackage}>
            Create Package
          </MenuItem>,
        ]
      : [];

  const adminMenuItems =
    userRoles && userRoles.includes("admin")
      ? [
          <MenuItem key="admin-specific-item">
            Admin-specific Menu Item
          </MenuItem>,
          ...tutorMenuItems,
        ]
      : [];

  // const menuItems = user
  //   ? userRoles && userRoles.includes("admin")
  //     ? adminMenuItems
  //     : commonMenuItems
  //   : loginMenuItems;

    if (isLoading) {
      // Render a loading state
      return <div>Loading...</div>;
    }

  return (
    <List>
      <ListItem sx={{ justifyContent: "flex-end" }}>
        <IconButton
          color="inherit"
          aria-label="toggle menu"
          onClick={toggleMenu}
        >
          {isMenuCollapsed ? <MenuIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </ListItem>
      {!isMenuCollapsed && (
        <>
          <ListItem button onClick={handleHomeClick} key="home">
            <ListItemText primary="Home" />
          </ListItem>
          {menuItems}
          {user && tutorMenuItems.length > 0 && (
            <ListItem button onClick={toggleSubmenu2} key="tutor-menu">
              <ListItemText primary="Tutor Menu" />
              {isSubmenu2Open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
          )}
          <List
            sx={{
              display: isSubmenu2Open ? "block" : "none",
              padding: 0,
              marginLeft: "16px",
              position: "relative",
              top: "-10px",
              zIndex: 1,
            }}
          >
            {tutorMenuItems}
          </List>
          {user && logoutMenuItems}
        </>
      )}
    </List>
  );
}

MenuPanel.propTypes = {
  isMenuCollapsed: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default MenuPanel;
