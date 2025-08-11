import React, { useState } from "react";
import { Box, TextField, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate("/searchpack", { state: { searchText } });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Search Packs
      </Typography>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        sx={{ display: "flex", gap: 2, alignItems: "center" }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Search
        </Button>
      </Box>
    </Container>
  );
}
