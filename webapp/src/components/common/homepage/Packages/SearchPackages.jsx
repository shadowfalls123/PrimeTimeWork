import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useFetchPackages from "./useFetchPackages";
import PackagesGrid from "./PackagesGrid";
import { Box, TextField, Button } from "@mui/material";

const SearchPackages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputText, setInputText] = useState(location.state?.searchText || ""); // For user input
  const [searchText, setSearchText] = useState(location.state?.searchText || ""); // For API fetch
  const {
    packages,
    isLoading,
    snackbarMessage,
    isSnackbarOpen,
    handleAddToCart,
    setIsSnackbarOpen,
    userCourses,
  } = useFetchPackages(searchText);

  const handleSearch = (event) => {
    event.preventDefault();
    if (inputText.trim()) {
      setSearchText(inputText); // Update searchText for the API call
      navigate("/searchpack", { state: { searchText: inputText } });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setIsSnackbarOpen(false);
  };

  const handleTitleClick = (pkg) => {
    navigate("/packdtls", { state: { pkg } });
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  return (
    <Box>
      {/* Search Bar */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
      >
        <TextField
          label="Search Packages"
          variant="outlined"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)} // Update inputText only
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Search
        </Button>
      </Box>

      {/* Packages Grid */}
      <PackagesGrid
        packages={packages}
        isLoading={isLoading}
        isAddedToCart={false}
        handleAddToCart={handleAddToCart}
        handleGoToCart={handleGoToCart}
        handleClose={() => {}}
        selectedPackage={null}
        setSelectedPackage={() => {}}
        snackbarMessage={snackbarMessage}
        isSnackbarOpen={isSnackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        userCourses={userCourses}
        handleTitleClick={handleTitleClick}
      />
    </Box>
  );
};

export default SearchPackages;
