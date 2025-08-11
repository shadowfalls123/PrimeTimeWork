import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { getSubmittedPapers, updatePack } from "../../services";
import ConfirmationDialog from "../common/ConfirmationDialog";

const EditPack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Extract pack data from location state or set default values
  const packData = location.state?.pack || {};
//   const [updatedPackData, setUpdatedPackData] = useState(packData);
  

  // Define state variables for form fields
  const [packTitle, setPackTitle] = useState(packData.packTitle || "");
  const [packDesc, setPackDesc] = useState(packData.packDesc || "");
  const [packPrice, setPackPrice] = useState(packData.packPrice || "");
  const [selectedPapers, setSelectedPapers] = useState(packData.selectedPapers || []);
  const [availablePapers, setAvailablePapers] = useState([]);

//   useEffect(() => {
//     // Fetch available papers
//     const fetchPapers = async () => {
//       try {
//         // Mock function to fetch available papers. Replace with actual API call.
//         const availablePapersData = [
//           { pid: "paper1", papertitle: "Paper 1" },
//           { pid: "paper2", papertitle: "Paper 2" },
//           // Add more paper objects as needed
//         ];
//         setAvailablePapers(availablePapersData);
//       } catch (error) {
//         console.error("Error fetching papers:", error);
//       }
//     };
//     fetchPapers();
//   }, []);

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogTitle === "Success") {
      navigate("/mypacks");
    }
  };

  // Handler to handle paper selection
  const handlePaperSelect = (paperId) => {
    setSelectedPapers([...selectedPapers, paperId]);
  };

  // Handler to handle paper removal
  const handleRemovePaper = (paperId) => {
    setSelectedPapers(selectedPapers.filter((id) => id !== paperId));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const packageData = {
      packid: packData.packid, // Include packid in the package data
      packTitle,
      packDesc,
      packPrice,
      selectedPapers,
    };

    try {
        logger.log("Package Data -->> ", packageData);
      const response = await updatePack(packageData);
      logger.log("Pack updated successfully:", response.data);
      setDialogTitle("Success");
      setDialogMessage("Pack Updated Successfully.");
      setDialogOpen(true);
    } catch (error) {
      console.error("Error updating pack:", error);
      setDialogTitle("Error");
      setDialogMessage("Failed to update pack. Please try again later.");
      setDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

//   // Handler to handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // Perform update operation (e.g., API call to update the pack data)
//     setTimeout(() => {
//       setLoading(false);
//       navigate("/mypacks"); // Redirect to MyPacks page after successful update
//     }, 2000); // Simulate API call delay
//   };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" sx={{ marginBottom: "20px", fontWeight: "bold" }}>
        Edit Pack
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
      <Paper sx={{ padding: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pack Title"
                value={packTitle}
                onChange={(e) => setPackTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pack Description"
                value={packDesc}
                onChange={(e) => setPackDesc(e.target.value)}
                required
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pack Price"
                type="number"
                value={packPrice}
                onChange={(e) => setPackPrice(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Paper</InputLabel>
                <Select
                  value="" // Reset value after each selection
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
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save"}
                </Button>
                <Button variant="contained" color="primary" onClick={handleCancel}>
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "Cancel"}
                </Button>
              </Grid>
          </Grid>
        </form>
      </Paper>
       )}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose}
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true} // Show only the OK button
      />
    </Container>
  );
};

export default EditPack;
