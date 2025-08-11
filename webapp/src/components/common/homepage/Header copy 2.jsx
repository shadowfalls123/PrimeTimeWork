import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
// import HomeIcon from "@mui/icons-material/Home";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import ExamsAreFunLogo from "../../../srcimages/examsarefun.png";
import { useAuth } from "../../common/Auth/AuthContext";
import MobileMenu from "./MobileMenu";
import { signOut } from "aws-amplify/auth";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  // display: "flex",
  // alignItems: "center",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  // flexGrow: 1,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function HeaderAppBar() {
  const { user, userRoles } = useAuth();
  const { items } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = useState(null);
  const isMainMenuOpen = Boolean(mainMenuAnchorEl);
  const isMobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [searchText, setSearchText] = useState("");

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

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchText.trim()) {
      navigate("/searchpack", { state: { searchText } });
    }
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
            {/* <Link to="/" style={{ textDecoration: "none", marginRight: "3px" }}>
              <HomeIcon style={{ fontSize: "35px", color: "white" }} />
            </Link> */}
            <Link to="/" style={{ textDecoration: "none", marginTop: "10px" }}>
              <Typography variant="h6" noWrap>
                <img src={ExamsAreFunLogo} alt="ExamsAreFun Logo" />
              </Typography>
            </Link>
          </Box>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter") handleSearch(event);
              }}
            />
            
          </Search>
          <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ marginLeft: 1 }}
            >
              Search
            </Button>
          <Box sx={{ flexGrow: 1 }} />
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
