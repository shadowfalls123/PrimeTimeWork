import React from "react";
import PropTypes from "prop-types";
import { TextField, Typography, Grid } from "@mui/material";


const ProfileForm = ({ profileData, isEditing, countryEntries, handleInputChange }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label={<span style={{ fontWeight: "bold" }}>First Name</span>}
            name="firstname"
            value={profileData.firstname || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>First Name:</b> {profileData.firstname || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="Last Name"
            name="lastname"
            value={profileData.lastname || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Last Name:</b> {profileData.lastname || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            select
            fullWidth
            label="Country"
            InputLabelProps={{ shrink: true }}
            name="countrycode"
            value={profileData.countrycode || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
            SelectProps={{
              native: true,
              inputProps: {
                tabIndex: 0,
                onKeyDown: (e) => {
                  const index = countryEntries.findIndex(
                    (country) => country.code === profileData.countrycode
                  );
                  if (e.key === "ArrowUp" && index > 0) {
                    handleInputChange({
                      target: {
                        name: "countrycode",
                        value: countryEntries[index - 1].code,
                      },
                    });
                  } else if (
                    e.key === "ArrowDown" &&
                    index < countryEntries.length - 1
                  ) {
                    handleInputChange({
                      target: {
                        name: "countrycode",
                        value: countryEntries[index + 1].code,
                      },
                    });
                  }
                },
              },
            }}
          >
            {countryEntries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </TextField>
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Country:</b>{" "}
            {countryEntries.find((country) => country.code === profileData.countrycode)?.name}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="Street"
            name="street"
            value={profileData.street || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Street:</b> {profileData.street || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="City"
            name="city"
            value={profileData.city || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>City:</b> {profileData.city || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="ZIP"
            name="zip"
            value={profileData.zip || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>ZIP:</b> {profileData.zip || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={profileData.useremail || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Email:</b> {profileData.useremail}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      <Grid item xs={12} md={8}>
        {isEditing ? (
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={profileData.phone || ""}
            onChange={handleInputChange}
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Phone:</b> {profileData.phone || "Not Provided"}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12} md={4}></Grid>
      {/* <Grid item xs={12} md={8}>
        {isEditing ? (
          <FormControlLabel
            control={
              <Checkbox
                name="isPublic"
                checked={profileData.isPublic || false}
                onChange={handleInputChange}
              />
            }
            label="Is Public"
            style={{ marginTop: "1rem" }}
          />
        ) : (
          <Typography variant="body1" style={{ marginTop: "1rem" }}>
            <b>Is Public:</b> {profileData.isPublic ? "Yes" : "No"}
          </Typography>
        )}
      </Grid> */}
    </Grid>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.shape({
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    countrycode: PropTypes.string,
    street: PropTypes.string,
    city: PropTypes.string,
    zip: PropTypes.string,
    useremail: PropTypes.string,
    phone: PropTypes.string,
    isPublic: PropTypes.bool,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  countryEntries: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default ProfileForm;
