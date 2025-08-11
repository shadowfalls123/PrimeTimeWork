import React, { useState, useEffect } from "react";
import { Grid, Typography, Button, Paper, Container } from "@mui/material";
import ImageUploader from "./ImageUploader";
import ProfileForm from "./ProfileForm";
import countries from "i18n-iso-countries";
import { getUserProfile, updateUserProfile, updateUserProfileImage, deleteUserProfileImage } from "../../../../services";
import { encryptData, decryptData } from "../../../../util/cryptoUtils"; // Make sure these are correctly defined
import { RingLoadingIcon } from "../../../common/LoadingIcon";
import logger from "../../../../util/logger";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const countryEntries = Object.entries(countries.getNames("en")).map(
  ([code, name]) => ({ code, name })
);

countryEntries.sort((a, b) => a.name.localeCompare(b.name));

const CACHE_KEY_PROFILE = 'userProfileData';
const CACHE_EXPIRY_KEY_PROFILE = 'userProfileDataExpiry';
const CACHE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({});
  const [fetchedImage, setFetchedImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userCountry, setUserCountry] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true); // Ensure loading state is active
    try {
      const data = await getUserProfile();
      setProfileData(data);
      setFetchedImage(data.profileImage);
      setUserCountry(data.countrycode);
      logger.log("User Country -->> ", userCountry);
      // Store data in local storage
      localStorage.setItem(CACHE_KEY_PROFILE, encryptData(data));
      localStorage.setItem(CACHE_EXPIRY_KEY_PROFILE, Date.now());
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false); // Loading is complete
    }
  };

  const isCacheValid = (expiryKey) => {
    const cachedTime = localStorage.getItem(expiryKey);
    if (!cachedTime) return false;
    return (Date.now() - cachedTime) < CACHE_EXPIRY_TIME;
  };

  useEffect(() => {
    const loadProfile = () => {
      if (isCacheValid(CACHE_EXPIRY_KEY_PROFILE)) {
        const cachedProfile = localStorage.getItem(CACHE_KEY_PROFILE);
        if (cachedProfile) {
          const data = decryptData(cachedProfile);
          setProfileData(data);
          setFetchedImage(data.profileImage);
          setUserCountry(data.countrycode);
          setIsLoading(false); // Cache is used, no need for further loading
          return;
        }
      }
      fetchData(); // Fetch from API if cache is invalid or unavailable
    };

    loadProfile();
  }, []);

  // useEffect(() => {
  //   if (isCacheValid(CACHE_EXPIRY_KEY_PROFILE)) {
  //     const cachedProfile = localStorage.getItem(CACHE_KEY_PROFILE);
  //     if (cachedProfile) {
  //       const data = decryptData(cachedProfile);
  //       setProfileData(data);
  //       setFetchedImage(data.profileImage);
  //       setUserCountry(data.countrycode);
  //     }
  //   } else {
  //     fetchData();
  //   }
  // }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = async (resizedImageBlob) => {
    const uploadedImageData = await updateUserProfileImage(resizedImageBlob);
    setFetchedImage(uploadedImageData.image);
  };

  const handleImageDelete = async () => {
    try {
      logger.log("In ProfilePage handleImageDelete");
      const response = await deleteUserProfileImage();
      logger.log("Image delete response:", response.data);
      setFetchedImage("");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleEditToggle = () => setIsEditing((prevEditing) => !prevEditing);

  const handleSave = async () => {
    await updateUserProfile(profileData);
    setIsEditing(false);

    // Update local storage after saving
    localStorage.setItem(CACHE_KEY_PROFILE, encryptData(profileData));
    localStorage.setItem(CACHE_EXPIRY_KEY_PROFILE, Date.now());
  };

  return (
    <div>
      {isLoading ? (
          <RingLoadingIcon />
        ) : (
    <Container maxWidth="sm" style={{ marginTop: "0rem" }}>
      <Paper style={{ padding: "2rem" }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ marginBottom: "20px", fontWeight: "bold" }}>
          My Account
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <ImageUploader onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} fetchedImage={fetchedImage} />
          </Grid>
          <Grid item xs={12} md={8}>
            <ProfileForm
              profileData={profileData}
              isEditing={isEditing}
              countryEntries={countryEntries}
              handleInputChange={handleInputChange}
            />
            <Grid container spacing={2} style={{ marginTop: "2rem" }}>
              <Grid item>
                {isEditing ? (
                  <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={handleEditToggle}>
                    Edit
                  </Button>
                )}
              </Grid>
              {isEditing && (
                <Grid item>
                  <Button variant="contained" color="secondary" onClick={handleEditToggle}>
                    Cancel
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
    )}
  </div>
  );
};

export default ProfilePage;
