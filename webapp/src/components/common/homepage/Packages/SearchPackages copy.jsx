import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useFetchPackages from "./useFetchPackages";
import PackagesGrid from "./PackagesGrid";

const SearchPackages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchText = location.state?.searchText || "";
  const {
    packages,
    isLoading,
    snackbarMessage,
    isSnackbarOpen,
    handleAddToCart,
//    setSnackbarMessage,
    setIsSnackbarOpen,
    userCourses,
  } = useFetchPackages(searchText);

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
  );
};

export default SearchPackages;
