import React, { useState } from "react";
import { useSelector } from "react-redux";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import ExamsAreFunLogo from "../../../srcimages/examsarefun.png";
import { signOut } from "aws-amplify/auth";
import { useAuth } from "../../common/Auth/AuthContext";

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
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
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
  const [mainMenuAnchorEl, setMainMenuAnchorEl] = React.useState(null);
  const isMainMenuOpen = Boolean(mainMenuAnchorEl);
  const isMobileScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    event.preventDefault(); // Prevent form submission
    navigate("/searchpack", { state: { searchText } });
  };

  const handleLogin = () => {
    handleMainMenuClose();
    navigate("/login");
  };

  const handleContactUs = () => {
    handleMainMenuClose();
    navigate("/contact");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      handleMainMenuClose();
      navigate("/");
    } catch (error) {
      //console.log("Error signing out: ", error);
    }
  };

  const handleMainMenuOpen = (event) => {
    setMainMenuAnchorEl(event.currentTarget);
  };

  const handleMainMenuClose = () => {
    setMainMenuAnchorEl(null);
  };
  
  function handleHomeClick() {
    handleMainMenuClose();
    navigate("/");
  }

  function handleProfileClick() {
    handleMainMenuClose();
    navigate("/profile");
  }
  
  function handleMyLearningsClick() {
    handleMainMenuClose();
    navigate("/mylearnings");
  }

  function handleDashhboardClick() {
    handleMainMenuClose();
    navigate("/dashboard");
  }

  function handleCreateExam() {
    handleMainMenuClose();
    navigate("/createexam");
  }

  function handleCreatePackage() {
    handleMainMenuClose();
    navigate("/createpackage");
  }

  function handleMyPapers() {
    handleMainMenuClose();
    navigate("/submittedpapers");
  }
  
  function handleMyPacks() {
    handleMainMenuClose();
    navigate("/mypacks");
  }

  const mainMenuId = "primary-menu";
const renderMainMenu = (
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
      // Remove default styling
      "& .MuiMenu-paper": {
        boxShadow: "none",
        margin: 0,
        width: "auto",
        borderRadius: 0,
        overflow: "visible",
      },
    }}
  >
    {[
      (user && userRoles && userRoles.includes("tutor")) && [
        <MenuItem key="home" onClick={handleHomeClick}>
          Home
        </MenuItem>,
        <MenuItem key="profile" onClick={handleProfileClick}>
          My Account
        </MenuItem>,
        <MenuItem key="my-learnings" onClick={handleMyLearningsClick}>
          My Learnings
        </MenuItem>,
        <MenuItem key="dashboard" onClick={handleDashhboardClick}>
          Dashboard
        </MenuItem>,
        <Divider key="divider1" />,
        <MenuItem key="create-exam" onClick={handleCreateExam}>
          Create Exam
        </MenuItem>,
        <MenuItem key="create-package" onClick={handleCreatePackage}>
        Create Package
      </MenuItem>,
        <MenuItem key="my-papers" onClick={handleMyPapers}>
          My Papers
        </MenuItem>,
        <MenuItem key="my-packs" onClick={handleMyPacks}>
          My Packs
        </MenuItem>,
        <Divider key="divider2" />,
        <MenuItem key="contact-us" onClick={handleContactUs}>
          Contact Us
        </MenuItem>,
        <MenuItem key="logout" onClick={handleLogout}>
          Logout
        </MenuItem>,
      ],
      (user && userRoles && userRoles.includes("admin")) && [
        <MenuItem key="home" onClick={handleHomeClick}>
          Home
        </MenuItem>,
        <MenuItem key="profile" onClick={handleProfileClick}>
          My Account
        </MenuItem>,
        <MenuItem key="create-exam" onClick={handleCreateExam}>
          Create Exam
        </MenuItem>,
        <MenuItem key="create-package" onClick={handleCreatePackage}>
        Create Package
      </MenuItem>,
        <MenuItem key="my-papers" onClick={handleMyPapers}>
          My Papers
        </MenuItem>,
        <MenuItem key="my-packs" onClick={handleMyPacks}>
          My Packs
        </MenuItem>,
        <MenuItem key="admin-specific">
          Admin-specific Menu Item
        </MenuItem>,
        <MenuItem key="contact-us" onClick={handleContactUs}>
          Contact Us
        </MenuItem>,
        <MenuItem key="logout" onClick={handleLogout}>
          Logout
        </MenuItem>,
      ],
      (user && userRoles && !userRoles.includes("tutor") && !userRoles.includes("admin")) && [
          <MenuItem key="home" onClick={handleHomeClick}>
            Home
          </MenuItem>,
          <MenuItem key="profile" onClick={handleProfileClick}>
            My Account
          </MenuItem>,
          <MenuItem key="my-learnings" onClick={handleMyLearningsClick}>
            My Learnings
          </MenuItem>,
          <MenuItem key="dashboard" onClick={handleDashhboardClick}>
           Dashboard
         </MenuItem>,          
          <MenuItem key="contact-us" onClick={handleContactUs}>
            Contact Us
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>,
        
      ],
      (user && !userRoles) && [
        
          <MenuItem key="home" onClick={handleHomeClick}>
            Home
          </MenuItem>,
          <MenuItem key="profile" onClick={handleProfileClick}>
            My Account
          </MenuItem>,
          <MenuItem key="my-learnings" onClick={handleMyLearningsClick}>
            My Learnings
          </MenuItem>,
          <MenuItem key="dashboard" onClick={handleDashhboardClick}>
            Dashboard
          </MenuItem>,           
          <MenuItem key="contact-us" onClick={handleContactUs}>
            Contact Us
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>,
    ],
  
      (!user) && [
        
          <MenuItem key="home" onClick={handleHomeClick}>
            Home
          </MenuItem>,
          <MenuItem key="login" onClick={handleLogin}>
            Login
          </MenuItem>,
    ],
    ]}
  </Menu>
);

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
              aria-controls={mainMenuId}
              aria-haspopup="true"
              onClick={(event) => {
                handleMainMenuOpen(event);
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            sx={{ display: { xs: "flex", md: "flex" }, alignItems: "center" }}
            >
            <Link to="/" style={{ textDecoration: "none", marginRight: "3px" }}>
              <HomeIcon style={{ fontSize: "35px", color: "white" }} />
            </Link>

            <Link to="/" style={{ textDecoration: "none", marginTop: "10px" }}>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ display: "block" }}
              >
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
                if (event.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </Search>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{ display: { xs: "flex", md: "flex" }, alignItems: "center" }}
          >
            <IconButton
              component={Link}
              to="/cart"
              size="small"
              aria-label="shopping cart"
              color="inherit"
              style={{
                color: "white",
                borderColor: "white",
                marginRight: "10px",
              }}
            >
              <Badge badgeContent={items.length} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMainMenu}
    </Box>
  );
}
