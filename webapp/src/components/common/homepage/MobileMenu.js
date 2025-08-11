import React from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem, Divider } from "@mui/material";
import logger from "../../../util/logger";

export default function MobileMenu({
  mainMenuAnchorEl = null, // Default value
  isMainMenuOpen,
  handleMainMenuClose,
  user = null, // Default value
  userRoles = [], // Default value
  navigate,
  handleLogout,
}) {
  const mainMenuId = "primary-menu";


  const handleNavigation = (path) => {
    handleMainMenuClose();
    navigate(path);
  };

  const menuItems = [
    {
      roles: ["guest"],
      items: [
        { label: "Home", action: () => handleNavigation("/") },
        { label: "Login", action: () => handleNavigation("/login") },
      ],
    },
    {
      roles: ["StudentRole"],
      items: [
        { label: "Home", action: () => handleNavigation("/") },
        { label: "My Account", action: () => handleNavigation("/profile") },
        { label: "My Learnings", action: () => handleNavigation("/mylearnings") },
        // { label: "Dashboard", action: () => handleNavigation("/dashboards") },
        { label: "Contact Us", action: () => handleNavigation("/contact") },
        { label: "Logout", action: handleLogout },
      ],
    },
    {
      roles: ["tutor"],
      items: [
        { label: "Home", action: () => handleNavigation("/") },
        { label: "My Account", action: () => handleNavigation("/profile") },
        { label: "My Learnings", action: () => handleNavigation("/mylearnings") },
        { label: "Dashboards", action: () => handleNavigation("/dashboards") },
        { divider: true },
        { label: "Create Exam", action: () => handleNavigation("/createexam") },
        { label: "Create Package", action: () => handleNavigation("/createpackage") },
        { label: "My Papers", action: () => handleNavigation("/submittedpapers") },
        { label: "My Packs", action: () => handleNavigation("/mypacks") },
        { label: "Dashboardtutor", action: () => handleNavigation("/dashboardtutor") },
        { divider: true },
        { label: "Contact Us", action: () => handleNavigation("/contact") },
        { label: "Logout", action: handleLogout },
      ],
    },
    {
      roles: ["admin"],
      items: [
        { label: "Home", action: () => handleNavigation("/") },
        { label: "My Account", action: () => handleNavigation("/profile") },
        { label: "Dashboards", action: () => handleNavigation("/dashboards") },
        { label: "Create Exam", action: () => handleNavigation("/createexam") },
        { label: "Create Package", action: () => handleNavigation("/createpackage") },
        { label: "My Papers", action: () => handleNavigation("/submittedpapers") },
        { label: "My Packs", action: () => handleNavigation("/mypacks") },
        { label: "Dashboardtutor", action: () => handleNavigation("/dashboardtutor") },
        { label: "Admin-specific Menu Item", action: () => {} },
        { label: "Contact Us", action: () => handleNavigation("/contact") },
        { label: "Logout", action: handleLogout },
      ],
    },
  ];

  const getMenuItemsForRoles = () => {
    logger.log("user", user);
    logger.log("userRoles", userRoles);
    if (!user) {
      // Guest: user does not exist
      return menuItems.find((group) => group.roles.includes("guest")).items;
    }

    if (user && (!userRoles || userRoles.length === 0)) {
      // User: user exists but has no specific roles
      logger.log("User exists but has no specific roles, defaulting it as StudentRole role");
      return menuItems.find((group) => group.roles.includes("StudentRole")).items;
    }

    // Roles (e.g., tutor, admin)
    return menuItems
      .filter((group) => userRoles.some((role) => group.roles.includes(role)))
      .flatMap((group) => group.items);
  };

  const itemsToRender = getMenuItemsForRoles();

  return (
    <Menu
      anchorEl={mainMenuAnchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id={mainMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMainMenuOpen}
      onClose={handleMainMenuClose}
      sx={{
        "& .MuiMenu-paper": {
          boxShadow: "none",
          margin: 0,
          width: "auto",
          borderRadius: 0,
          overflow: "visible",
        },
      }}
    >
      {itemsToRender.map((item, index) =>
        item.divider ? (
          <Divider key={`divider-${index}`} />
        ) : (
          <MenuItem key={item.label} onClick={item.action}>
            {item.label}
          </MenuItem>
        )
      )}
    </Menu>
  );
}

MobileMenu.propTypes = {
  mainMenuAnchorEl: PropTypes.object,
  isMainMenuOpen: PropTypes.bool.isRequired,
  handleMainMenuClose: PropTypes.func.isRequired,
  user: PropTypes.object, // If no specific structure is required for the user object
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired, // userRoles is required
  navigate: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

