import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemText, MenuItem } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useAuth } from "../../common/Auth/AuthContext";
import { signOut } from "aws-amplify/auth";

function MenuPanel({ isMenuCollapsed, toggleMenu }) {
  const navigate = useNavigate();
  const [isSubmenu2Open, setSubmenu2Open] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  const { user, userRoles } = useAuth();

  const toggleSubmenu2 = () => {
    setSubmenu2Open(!isSubmenu2Open);
  };

  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleContactUs = () => {
    navigate("/contact");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  function handleProfileClick() {
    navigate("/profile");
  }

  function handleMyLearningsClick() {
    navigate("/mylearnings");
  }

  // function handleDashhboardClick() {
  //   navigate("/dashboards");
  // }

  function handleDashhboardTutorClick() {
    navigate("/dashboardtutor");
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
    <MenuItem key="my-learnings" onClick={handleMyLearningsClick}>
      My Learnings
    </MenuItem>,
    // <MenuItem key="dashboard" onClick={handleDashhboardClick}>
    //   Dashboard
    // </MenuItem>,
    <ListItem button onClick={handleContactUs} key="contact-us">
      <ListItemText primary="Contact Us" />
    </ListItem>,
  ];

  const loginMenuItems = [    
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
          <MenuItem key="dashboardtutor" onClick={handleDashhboardTutorClick}>
            Dashboard
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

      useEffect(() => {
    const calculateMenuItems = () => {
        const menuItems = user
    ? userRoles && userRoles.includes("admin")
      ? adminMenuItems
      : commonMenuItems
    : loginMenuItems;

        setMenuItems(menuItems); // Default menu for logged-in users
    };
  
    calculateMenuItems();
  }, [userRoles]);

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

// PropTypes validation
MenuPanel.propTypes = {
  isMenuCollapsed: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
};

export default MenuPanel;
