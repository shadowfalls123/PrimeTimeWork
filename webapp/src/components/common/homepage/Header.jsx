import React, { useState } from "react";
import { useSelector } from "react-redux";
// import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import ExamsAreFunLogo from "../../../srcimages/examsarefun.png";
import { useAuth } from "../../common/Auth/AuthContext";
import MobileMenu from "./MobileMenu";
import { signOut } from "aws-amplify/auth";

export default function HeaderAppBar() {
  const { user, userRoles } = useAuth();
  const { items } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = useState(null);
  const isMainMenuOpen = Boolean(mainMenuAnchorEl);
  const isMobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleMainMenuOpen = (event) => setMainMenuAnchorEl(event.currentTarget);
  const handleMainMenuClose = () => setMainMenuAnchorEl(null);

  const handleLogout = async () => {
    try {
      await signOut();
      handleMainMenuClose();
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSearchClick = () => {
    navigate("/searchpack");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobileScreen && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open main menu"
              aria-haspopup="true"
              onClick={handleMainMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link to="/" style={{ textDecoration: "none", marginRight: "3px" }}>
              <HomeIcon style={{ fontSize: "35px", color: "white" }} />
            </Link>
            <Link to="/" style={{ textDecoration: "none", marginTop: "10px" }}>
              <Typography variant="h6" noWrap>
                <img src={ExamsAreFunLogo} alt="ExamsAreFun Logo" />
              </Typography>
            </Link>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={handleSearchClick}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            component={Link}
            to="/cart"
            size="small"
            color="inherit"
          >
            <Badge badgeContent={items.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {!isMobileScreen && (
            <IconButton
              size="large"
              edge="end"
              aria-label="open main menu"
              aria-haspopup="true"
              onClick={handleMainMenuOpen}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <MobileMenu
        mainMenuAnchorEl={mainMenuAnchorEl}
        isMainMenuOpen={isMainMenuOpen}
        handleMainMenuClose={handleMainMenuClose}
        user={user}
        userRoles={userRoles}
        navigate={navigate}
        handleLogout={handleLogout}
      />
    </Box>
  );
}
