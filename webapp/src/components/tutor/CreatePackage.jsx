import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { createPackage, getSubmittedPapers } from "../../services";
import ConfirmationDialog from "../common/ConfirmationDialog";

const CreatePackage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [packTitle, setPackTitle] = useState("");
  const [packDesc, setPackDesc] = useState("");
  const [packPrice, setPackPrice] = useState("");
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [availablePapers, setAvailablePapers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true);
      try {
        const response = await getSubmittedPapers();
        logger.log("Papers fetched successfully:", response.data);
        setAvailablePapers(response.data);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
      setIsLoading(false);
    };
    fetchPapers();
  }, []);

  const handlePaperSelect = (paperId) => {
    setSelectedPapers([...selectedPapers, paperId]);
  };

  //   const handleAddPaper = () => {
  //     if (selectedPapers.length === 0) return;
  //     const paperId = selectedPapers[selectedPapers.length - 1];
  //     logger.log("PaperId -->> ", paperId);
  //     setSelectedPapers([...selectedPapers.slice(0, -1)]);
  //   };

  const handleRemovePaper = (paperId) => {
    setSelectedPapers(selectedPapers.filter((id) => id !== paperId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const packageData = {
      packTitle,
      packDesc,
      packPrice,
      selectedPapers,
    };

    try {
      logger.log("Package Data -->> ", packageData);
      const response = await createPackage(packageData);
      logger.log("Package created successfully:", response.data);
      setDialogTitle("Success");
      setDialogMessage("Package Created Successfully.");
      setDialogOpen(true);
    } catch (error) {
      console.error("Error creating package:", error);
      setDialogTitle("Error");
      setDialogMessage("Failed to create package. Please try again later.");
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogTitle === "Success") {
      navigate("/mypacks");
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "0rem" }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        Create Package
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ padding: 0 }}>
          <Paper sx={{ padding: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Package Title"
                    value={packTitle}
                    onChange={(e) => setPackTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Package Description"
                    value={packDesc}
                    onChange={(e) => setPackDesc(e.target.value)}
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Package Price"
                    value={packPrice}
                    onChange={(e) => setPackPrice(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Paper</InputLabel>
                    <Select
                      // value={selectedPapers[selectedPapers.length - 1]}
                      value={
                        selectedPapers.length > 0
                          ? selectedPapers[selectedPapers.length - 1]
                          : ""
                      }
                      onChange={(e) => handlePaperSelect(e.target.value)}
                    >
                      {availablePapers.map((paper) => (
                        <MenuItem key={paper.pid} value={paper.pid}>
                          {paper.papertitle}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddPaper}
                >
                  Add Paper to Package
                </Button>
              </Grid> */}
                <Grid item xs={12}>
                  <Typography variant="h6">Selected Papers:</Typography>
                  {selectedPapers.map((paperId) => (
                    <div key={paperId}>
                      {availablePapers
                        .filter((paper) => paper.pid === paperId)
                        .map((paper) => (
                          <div key={paper.pid}>
                            {paper.papertitle}{" "}
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleRemovePaper(paper.pid)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                    </div>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Package"
                    )}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      )}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose}
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true}
      />
    </Container>
  );
};

export default CreatePackage;
