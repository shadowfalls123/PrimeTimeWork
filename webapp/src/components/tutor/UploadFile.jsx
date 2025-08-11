import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  // LinearProgress,
} from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { uploadCSVData } from "../../services";

function FileUpload() {
  const location = useLocation();
  //const selectedPaper = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined
  const paper = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined
  //#PROD logger.log("paper -> ", paper);
  if (!paper) {
    return <div>Loading...</div>; // or handle other cases where result is null/undefined
  }

  // //#PROD logger.log(" selectedPaper -> ", selectedPaper);
  // const paper = selectedPaper;
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Track upload success state
  const [uploadError, setUploadError] = useState(""); // New state for error messages

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClose = () => {
    setUploadSuccess(false);
    setUploadError(""); // Clear any error messages when closing the dialog
  };
  
  const handleUpload = async () => {
    setUploading(true);
    setUploadError(""); // Clear any previous error messages
    setUploadSuccess(false); // Ensure success is false initially
    try {
      await uploadCSVData(selectedFile, paper);
//     logger.log("response -->> ", response);   
     //#PROD logger.log("Data upload successfully");
        setUploadSuccess(true); // Set upload success state to true after completion
    } catch (error) {
//      console.error("Error uploading data:", error);
      // Handle error condition, e.g., show error message to the user
//      alert(error.message); // Show error message to the user
      setUploadError(error.message); // Set error message
    setUploadSuccess(false); // Prevent success dialog from showing
    } finally {
      setUploading(false);
      setSelectedFile(null); // Clear selected file after upload
  
      // Hide success message after 5 seconds (adjust duration as needed)
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
    }
  };
  

  return (
    <Box
      sx={{
        border: "1px dashed grey",
        borderRadius: "4px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Upload Questions Using CSV File
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title</TableCell>
              <TableCell>Exam Description</TableCell>
              <TableCell>Number of Questions</TableCell>
              <TableCell>Allocated Time</TableCell>
              <TableCell>Paper Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={`${paper.userid}-${paper.pid}`}>
              <TableCell>{paper.papertitle}</TableCell>
              <TableCell>{paper.paperdesc}</TableCell>
              <TableCell>{paper.qcount}</TableCell>
              <TableCell>{paper.examtime}</TableCell>
              <TableCell>{paper.price}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
<br></br>
      <Typography sx={{ marginBottom: "16px" }}>
        <b>File should have column headers as:</b> question, answer, option1, option2, option3, option4,
        answerExplanation
      </Typography>
      <Typography sx={{ marginBottom: "16px" }}>
        <b>Maximum characters allowed are as shown:</b> question (500), answer (100), options (100
        each), answerExplanation (1000)
      </Typography>
      <Typography sx={{ marginBottom: "16px" }}>
        <b>Maximum number of questions allowed in single upload file is:</b> 30
      </Typography>

      {selectedFile ? (
        <>
          <Typography sx={{ marginBottom: "16px" }}>
            Selected file: {selectedFile.name}
          </Typography>

          {uploading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} sx={{ marginRight: "8px" }} />
              <Typography>Uploading...</Typography>
            </Box>
          ) : (
            <Button variant="contained" onClick={handleUpload}>
              Upload
            </Button>
          )}
        </>
      ) : (
        <>
                  {uploadSuccess ? (
            <Typography sx={{ marginBottom: "16px", color: "green" }}>
              Data Uploaded successfully!
            </Typography>
          ) : null}

          <Typography sx={{ marginBottom: "16px" }}>
            Drag and drop your file here
          </Typography>
          <Tooltip title="Upload" arrow>
            <IconButton component="label" htmlFor="file-upload">
              <AddCircle sx={{ fontSize: "64px" }} />
            </IconButton>
          </Tooltip>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </>
      )}
      {/* <Dialog open={uploadSuccess} onClose={handleClose}> */}
      <Dialog open={uploadSuccess || !!uploadError} onClose={handleClose}>
      <DialogTitle>{uploadSuccess ? "Upload Successful" : "Upload Error"}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {/* Data Uploaded successfully! */}
            {uploadSuccess
              ? "Data Uploaded successfully!"
              : `Error: ${uploadError}`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FileUpload;