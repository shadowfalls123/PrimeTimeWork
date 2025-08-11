import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Rating,
  TextField,
  Container,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";
//import PropTypes from 'prop-types';
import { saveUserFeedback } from "../../services";
//import { RingLoadingIcon } from "../common/LoadingIcon";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../common/ConfirmationDialog";
import logger from "../../util/logger";

const ResultsDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userFeedback, setUserFeedback] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false); // State to track feedback submission

  //  const [reviewExamResult, setReviewExamResult] = useState(false);

  const {
    pid,
    selectedPaper,
    examScore,
    totalQuestions,
    totalPossibleScore,
    sectionWiseScores,
    sectionWiseQuestionCount,
    sectionWiseTotalPossibleScores,
    sectionWiseUnansweredQuestions,
    totalUnansweredQuestions,
    resultData,
    selectedPack,
  } = location.state;
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Calculate overall percentage
  const overallPercentage = ((examScore / totalPossibleScore) * 100).toFixed(2);

  // const [isLoading, setIsLoading] = useState(false);
  //#PROD logger.log("examScore is -->> ", examScore);
  //#PROD logger.log("totalQuestions is -->> ", totalQuestions);
  //#PROD logger.log("pid is -->> ", pid);
  //#PROD logger.log("resultData is -->> ", resultData);

  const handleFeedbackChange = (event) => {
    setUserFeedback(event.target.value);
  };

  const handleRatingChange = (event, newValue) => {
    setUserRating(newValue);
  };

  const handleReviewClick = () => {
    //    setReviewExamResult(true);
    logger.log("pid is -->> ", pid);
    logger.log("selectedPaper is -->> ", selectedPaper);
    logger.log("resultData is -->> ", resultData);
    logger.log("selectedPack is -->> ", selectedPack);

    navigate("/reviewans", {
      state: {
        // examScore,
        // totalQuestions,
        pid,
        resultData,
        selectedPaper,
        selectedPack,
      },
    });
  };

  const handleSubmit = async () => {
    // Handle submission of feedback and rating (e.g., send to server/database)
    //#PROD logger.log("User Feedback:", userFeedback);
    //#PROD logger.log("User Rating:", userRating);
    // Additional logic for sending data to server/database
    // Clear input fields or perform any other necessary actions

    const feedback = {
      userfeedback: userFeedback,
      userrating: userRating,
      pid: pid,
    };
    //#PROD logger.log(" User feedback is -->> ", feedback)

    //    await saveUserFeedback(feedback);
    //   setFeedbackSubmitted(true); // Set feedback submitted to true
    //   alert("Thank you for providing the feedback.")
    //#PROD logger.log("response is -->> ", response)
    try {
      await saveUserFeedback(feedback);
      setFeedbackSubmitted(true);
      setOpenDialog(true);
      setDialogTitle("Feedback Submitted");
      setDialogMessage("Thank you for providing the feedback.");
    } catch (error) {
      setOpenDialog(true);
      setDialogTitle("Error");
      setDialogMessage("Failed to submit feedback.");
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Container
      maxWidth="xl"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h2" mb={2}>
            Results
          </Typography>
          <Typography variant="body1" mb={2}>
            <b>You Scored:</b> {examScore} out of {totalPossibleScore} marks (
            <b>{overallPercentage}%</b>)
          </Typography>
          <Typography variant="body1" mb={2}>
            <b>You attempted:</b> {totalQuestions - totalUnansweredQuestions}{" "}
            out of {totalQuestions} questions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" mb={2}>
            <b>Section Wise Scores:</b>
          </Typography>
          {Object.entries(sectionWiseScores).map(([section, score], index) => {
            // Calculate section-wise percentage
            const sectionPercentage = (
              (score / sectionWiseTotalPossibleScores[section]) *
              100
            ).toFixed(2);

            return (
              <Box
                key={index}
                sx={{
                  backgroundColor: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "5px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1">
                  <b>{section}:</b> {score} out of{" "}
                  {sectionWiseTotalPossibleScores[section]} (
                  <b>{sectionPercentage}%</b>)
                </Typography>
                <Typography variant="body2">
                  (Total Questions: {sectionWiseQuestionCount[section]})
                </Typography>
              </Box>
            );
          })}
          <Divider sx={{ mb: 2 }} />
          {Object.values(sectionWiseUnansweredQuestions).some(
            (count) => count > 0
          ) && (
            <Typography variant="body1" mb={2}>
              <b>Section Wise Unanswered Questions:</b>
            </Typography>
          )}
          {Object.entries(sectionWiseUnansweredQuestions).map(
            ([section, unansweredQuestions], index) =>
              unansweredQuestions > 0 && (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">
                    <b>{section}:</b> {unansweredQuestions} unanswered questions
                  </Typography>
                </Box>
              )
          )}
        </CardContent>
      </Card>

      <Box>
        <Typography variant="body1" mb={2}>
          Rate the quiz:
        </Typography>
        <Rating
          name="quiz-rating"
          value={userRating}
          onChange={handleRatingChange}
          max={5}
        />

        <TextField
          multiline
          rows={4}
          placeholder="Enter your feedback here"
          value={userFeedback}
          onChange={handleFeedbackChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={feedbackSubmitted} // Disable button if feedback is submitted
          sx={{
            margin: "10px",
          }}
        >
          Submit Feedback & Rating
        </Button>
        <Button
          variant="contained"
          onClick={handleReviewClick}
          sx={{
            margin: "10px",
          }}
        >
          Review Result
        </Button>
      </Box>

      <ConfirmationDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose} // Close the dialog when OK button is clicked
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true}
      />
    </Container>
  );
};

export default ResultsDisplay;
