import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Grid,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { publishPack } from "../../services";

const ViewPacks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPack = location.state.pack || [];
  const [isLoading, setIsLoading] = useState(false);
  const [packs, setPacks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  useEffect(() => {
    const fetchPacks = async () => {
      setIsLoading(true);
      try {
        logger.log("Selected pack is :", selectedPack);
        setPacks(selectedPack);
        logger.log("Packs:", packs);
      } catch (error) {
        console.error("Error fetching packs:", error);
      }
      setIsLoading(false);
    };
    fetchPacks();
  }, []);

  const handleEditClick = (pack) => {
    // Handle edit functionality
    logger.log("In handleEditClick MyPacks", pack);
    navigate("/editpack", { state: { pack: selectedPack } });
  };
  const handleCancelClick = () => {
    navigate(-1);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogTitle === "Success") {
      navigate("/mypacks");
    }
  };
  
  const handlePublishPackage = async() => {
      setIsLoading(true);
  
      try {
          logger.log("selectedPack -->> ", selectedPack);
        const response = await publishPack(selectedPack);
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
    
    

  
  return (
    <Container maxWidth="md">
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        View Packs
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {selectedPack.map((pack) => ( */}
              <TableRow key={selectedPack.packid}>
                <TableCell>{selectedPack.packTitle}</TableCell>
                <TableCell>{selectedPack.packDesc}</TableCell>
                <TableCell>{selectedPack.packPrice}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginRight: 1 }}
                    onClick={handleEditClick}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCancelClick}
                  >
                    Back
                  </Button>
                </TableCell>
              </TableRow>
              {/* ))} */}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <br></br>
                      <Grid container justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handlePublishPackage}
                  >
                    Publish Package
                  </Button>
                </Grid>
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

export default ViewPacks;
