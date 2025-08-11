import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Container,
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
//import { useLocation } from "react-router-dom";
import { saveResult } from "../../services";
import { RingLoadingIcon } from "../common/LoadingIcon";
import { useNavigate } from "react-router-dom";
import CustomDialog from "../common/ConfirmationDialog";
import { makeStyles } from "@mui/styles";
import { getExamQuestions } from "../../services";

const useStyles = makeStyles(() => ({
  button: {
    padding: "4px 8px", // Adjust padding to reduce button size
    minWidth: "unset", // Remove minimum width to allow smaller button size
    fontSize: "0.7rem", // Adjust font size to make the text smaller
  },
}));

const ExamPage = () => {
  const classes = useStyles();
 // const location = useLocation();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedPack, setSelectedPack] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [examTime, setExamTime] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(1000000); // Initialize as 0; update when examData is available
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false); // State for dialog
  const [reviewedQuestions, setReviewedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Introduce loading state

 useEffect(() => {
  let listenerAdded = false;

  const sendHandshake = () => {
      logger.log("[Child] Sending handshake to parent.");
      window.opener.postMessage("childReady", window.location.origin);
  };

  const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
          console.warn("Ignoring message from untrusted origin:", event.origin);
          return;
      }

      logger.log("[Child] Received message:", event.data);

      if (event.data.type === "examData") {
          const { examTime, selectedPack, selectedPaper } = event.data.payload;
          logger.log("[Child] Received exam data:", { examTime, selectedPack, selectedPaper });
          setExamData({ examTime, selectedPack, selectedPaper });
                  setSelectedPack(selectedPack);
        setSelectedPaper(selectedPaper);
        setExamTime(examTime);
      }
  };

  // Add the message listener only once
  if (!listenerAdded) {
      logger.log("[Child] Adding message listener.");
      window.addEventListener("message", handleMessage);
      listenerAdded = true;

      // Send handshake after the listener is ready
      sendHandshake();
  }

  return () => {
      logger.log("[Child] Removing message listener.");
      window.removeEventListener("message", handleMessage);
  };
}, []);
      
  useEffect(() => {
    const fetchExamQuestions = async () => {
      try {
        if (examData) {
          //      const { examTime, selectedPaper, selectedPack } = examData;
                logger.log("examTime is -> ", examTime);
                logger.log("selectedPaper is -> ", selectedPaper);
                logger.log("selectedPack is -> ", selectedPack);
                logger.log("Setting remaining time and fetching questions...");
                logger.log("examTime is -> ", examTime);
                setRemainingTime(examTime * 60); // Set remaining time in seconds
                // Fetch questions here if needed, based on selectedPaper
              }

              setOpenDialog(true);
              setDialogTitle("Greetings");
              setDialogMessage("Do not close the window or move to any other window. This will result in submition of Exam. All the Best for your Exam.");
          
              if (!selectedPaper || !selectedPack) {
                setOpenDialog(true);
                setDialogTitle("Error");
                setDialogMessage("Missing exam details. Please return to the previous page.");
                return;
              }

        logger.log("In fetchExamQuestions 1.");
        logger.log("selectedPaper.pid is -> ", selectedPaper.pid);
        logger.log("selectedPack.packid is -> ", selectedPack.packid);
        const response = await getExamQuestions(selectedPaper.pid, selectedPack.packid);
        if (!response || response.length === 0) {
          setOpenDialog(true);
          setDialogTitle("Error");
          setDialogMessage("Exam questions not available");
        return; // Exit function
      } else {
          setQuestions(response);
          logger.log(" In fetchExamQuestions response is -> ", response);
          
        }
      } catch (err) {
        console.error(err);
      setOpenDialog(true);
      setDialogTitle("Error");
      setDialogMessage("Failed to fetch submitted papers");
      } finally {
        setIsLoading(false); // Loading complete
      }
    };

    if (examData) {
      fetchExamQuestions();
    }
  }, [examData]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        // Check if component is still mounted and time is greater than 0
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          // Clear the interval when time reaches 0
          clearInterval(interval);
          // Optionally, perform any actions you need when time is up
          showFinalResult();
          setShowResults(true);
          return prevTime;
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [remainingTime, showResults]);

  // Convert the remaining time to minutes and seconds
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const handleOptionChange = (questionId, optionValue) => {
    setAnswers({ ...answers, [questionId]: optionValue.toString() });
    if (currentQuestion == 0) {
      //##      setExamQuestions(apiQuestions); //Setting data in examQuestions when the user is on 1st question. could not set it in the beginning hence using logic to set it when the user is on 1st question
    }
  };

  // Function to handle confirmation dialog open
  const handleOpenConfirmationDialog = () => {
    setOpenConfirmationDialog(true);
  };

  // Function to handle confirmation dialog close
  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
    setOpenDialog(false);
  };

  const handleNextClick = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmitClick = async () => {
    handleOpenConfirmationDialog();
  };

  const handleClearAnswer = (questionId) => {
    const updatedAnswers = { ...answers };
    delete updatedAnswers[questionId];
    setAnswers(updatedAnswers);
  };

  const handleReviewLater = (questionId) => {
    if (reviewedQuestions.includes(questionId)) {
      // Remove from reviewedQuestions if already reviewed
      setReviewedQuestions(reviewedQuestions.filter((id) => id !== questionId));
    } else {
      // Add to reviewedQuestions if not reviewed
      setReviewedQuestions([...reviewedQuestions, questionId]);
    }
  };

  const handleConfirmSubmit = async () => {
    setShowResults(true);
    await showFinalResult();
    handleCloseConfirmationDialog(); // Close the confirmation dialog after confirming
  };

  const handlePreviousClick = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleCutCopyPaste = (event) => {
    event.preventDefault();
  };

  const handleSelect = (event) => {
    event.preventDefault();
    return false;
  };

  // Map exam type to their respective handlers
const examTypeHandlers = {
  normalExam: (response, resultData) => {
    const {
      examscore,
      totalquestions,
      totalPossibleScore,
      sectionWiseScores,
      sectionWiseTotalPossibleScores,
      sectionWiseQuestionCount,
      totalUnansweredQuestions,
      sectionWiseUnansweredQuestions,
    } = response;

    navigate("/result", {
      state: {
        examScore: examscore,
        totalQuestions: totalquestions,
        totalPossibleScore,
        sectionWiseScores,
        sectionWiseTotalPossibleScores,
        sectionWiseQuestionCount,
        totalUnansweredQuestions,
        sectionWiseUnansweredQuestions,
        pid,
        resultData,
        selectedPaper,
        selectedPack
      },
    });
  },
  personalityAssessment: (response) => {
    logger.log("In ExamPage personalityAssessment response is ->", response);
    navigate("/personality-report", {
      state: { response },
    });
  },
  // Add future exam type handlers here
};

const showFinalResult = async () => {
  const resultData = {
    answers: questions.map((q) => ({
      quesid: q.quesid,
      pid: q.pid,
      selectedAns: answers[q.quesid],
    })),
    paperDetails: {
      category: selectedPaper.category, // Replace with actual variable holding this info
      subcategory: selectedPaper.subcategory,
      subcategorylvl2: selectedPaper.subcategorylvl2,
    },
  };
     
  logger.log("In ExamPage resultData is ->", resultData);

  try {
    // Save user responses and get the exam result from the backend
    const response = await saveResult(resultData);
    // Update examScore and totalQuestions only if response.data exists
    // if (response.data) {
    //   setShowResults(true);
    // }
    logger.log("[ExamPage] - saveResult response -->> ", response);
    const examCategory = selectedPaper.category; 
    logger.log("Exam category is ->", examCategory);

    if (examCategory === "Personality Assessment") {
      // Handle Personality Assessment
      examTypeHandlers.personalityAssessment(response.data);
    } else {
      // Default to normal exam
      examTypeHandlers.normalExam(response.data, resultData);
    }

    // const handler = examTypeHandlers[examCategory];

    //   if (handler) {
    //     handler(response.data, resultData); // Pass resultData and pid to handlers
    //   } else {
    //     throw new Error("Unhandled exam type.");
    //   }
  } catch (error) {
    console.error("Error while saving result:", error);
  }
};

  // const showFinalResult = async () => {
  //   const resultData = {
  //     answers: questions.map((q) => ({
  //       quesid: q.quesid,
  //       pid: q.pid,
  //       selectedAns: answers[q.quesid],
  //     })),
  //     paperDetails: {
  //       category: selectedPaper.category, // Replace with actual variable holding this info
  //       subcategory: selectedPaper.subcategory,
  //       subcategorylvl2: selectedPaper.subcategorylvl2,
  //     },
  //   };
       
  //   logger.log("In ExamPage resultData is ->", resultData);

  //   try {
  //     // Save user responses and get the exam result from the backend
  //     const response = await saveResult(resultData);
  //     // Update examScore and totalQuestions only if response.data exists
  //     if (response.data) {
  //       setShowResults(true);
  //       const examScore = response.data.examscore;
  //       const totalQuestions = response.data.totalquestions;
  //       const totalPossibleScore = response.data.totalPossibleScore;
  //       const sectionWiseScores = response.data.sectionWiseScores;
  //       const sectionWiseTotalPossibleScores =
  //         response.data.sectionWiseTotalPossibleScores;
  //       const sectionWiseQuestionCount = response.data.sectionWiseQuestionCount;
  //       const totalUnansweredQuestions = response.data.totalUnansweredQuestions;
  //       const sectionWiseUnansweredQuestions =
  //         response.data.sectionWiseUnansweredQuestions;

  //       handleResultSaveSuccess(
  //         examScore,
  //         totalQuestions,
  //         totalPossibleScore,
  //         sectionWiseScores,
  //         sectionWiseTotalPossibleScores,
  //         sectionWiseQuestionCount,
  //         totalUnansweredQuestions,
  //         sectionWiseUnansweredQuestions,
  //         resultData
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error while saving result:", error);
  //   }
  // };

  // const handleResultSaveSuccess = (
  //   examScore,
  //   totalQuestions,
  //   totalPossibleScore,
  //   sectionWiseScores,
  //   sectionWiseTotalPossibleScores,
  //   sectionWiseQuestionCount,
  //   totalUnansweredQuestions,
  //   sectionWiseUnansweredQuestions,
  //   resultData
  // ) => {
  //   navigate("/result", {
  //     state: {
  //       examScore,
  //       totalQuestions,
  //       totalPossibleScore,
  //       sectionWiseScores,
  //       sectionWiseTotalPossibleScores,
  //       sectionWiseQuestionCount,
  //       totalUnansweredQuestions,
  //       sectionWiseUnansweredQuestions,
  //       pid,
  //       resultData,
  //       selectedPaper,
  //       selectedPack,
  //     },
  //   });
  // };

  useEffect(() => {
    if (remainingTime <= 0 && !showResults) {
      showFinalResult();
      setShowResults(true);
    }
  }, [remainingTime, showResults]);

  const handleQuestionClick = (index) => {
    setCurrentQuestion(index);
  };

  const pid = questions.length > 0 ? questions[0].pid : null;

  const renderQuestion = (question) => {
    const isReviewed = reviewedQuestions.includes(question.quesid);
    // Log qtxt to check the base64 image string
    // logger.log("Question content:", question.qtxt);
    return (
      <Container maxWidth="md">
        <Box
          key={question.quesid}
          mt={4}
          mb={4}
          style={{
            userSelect: "none", // Disable text selection
            MozUserSelect: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
          }}
          onCut={handleCutCopyPaste}
          onCopy={handleCutCopyPaste}
          onPaste={handleCutCopyPaste}
        >
          <Typography variant="h5" component="h2" mb={2}>
            <span dangerouslySetInnerHTML={{ __html: question.qtxt }} />
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              name={`question-${question.quesid}`}
              value={
                answers[question.quesid] !== undefined
                  ? answers[question.quesid]
                  : ""
              }
              onChange={(event) =>
                handleOptionChange(
                  question.quesid,
                  parseInt(event.target.value)
                )
              }
              onCut={handleCutCopyPaste}
              onCopy={handleCutCopyPaste}
              onPaste={handleCutCopyPaste}
              onSelect={handleSelect} // Prevent text selection
            >
              {Object.keys(question)
                .filter((key) => key.startsWith("op"))
                .map((key, index) => (
                  <FormControlLabel
                    key={index}
                    value={(index + 1).toString()} // Convert to string
                    control={<Radio />}
                    // Render the option text or image content
                    label={
                      <span
                        dangerouslySetInnerHTML={{ __html: question[key] }}
                      />
                    }
                  />
                ))}
            </RadioGroup>
          </FormControl>
          <Box mt={2} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={() => handleClearAnswer(question.quesid)}
              disabled={!answers[question.quesid]}
            >
              Clear Answer
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleReviewLater(question.quesid)}
              style={{ color: isReviewed ? "red" : "inherit" }}
            >
              Review Later
            </Button>
          </Box>
        </Box>
      </Container>
    );
  };

  const renderSectionsAccordion = () => {
    if (!Array.isArray(questions) || questions.length === 0) {
      return <Typography>No questions available.</Typography>;
    }
    let globalQuestionNumber = 1; // Start numbering from 1
    const sections = [...new Set(questions.map((q) => q.section))]; // Get unique sections
    return (
      <Box mt={4}>
        {sections.map((section) => (
          <Accordion key={section}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${section}-content`}
              id={`${section}-header`}
            >
              <Typography variant="h6">{section}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="flex" flexWrap="wrap" gap="8px">
                {questions
                  .filter((q) => q.section === section)
                  .map((question) => {
                    const isAnswered = !!answers[question.quesid];
                    const isReviewed = reviewedQuestions.includes(question.quesid);
                    return (
                      <Button
                        key={question.quesid}
                        variant="contained"
                        color={isAnswered ? "success" : "error"}
                        onClick={() =>
                          handleQuestionClick(
                            questions.findIndex((q) => q.quesid === question.quesid)
                          )
                        }
                        className={classes.button} // Apply custom button styles
                        style={{
                          marginRight: "8px",
                          backgroundColor: isAnswered
                            ? "lightgreen"
                            : isReviewed
                            ? "lightcoral"
                            : "lightgrey",
                          color: isReviewed ? "red" : "inherit", // Adjust text color for reviewed
                        }}
                      >
                        {globalQuestionNumber++}
                      </Button>
                    );
                  })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="md">
            {isLoading ? (
      <div>
        <RingLoadingIcon />
      </div>
    ) : (
      <Box mt={4} mb={4}>
        <Box mt={4} mb={4}>
          <Typography variant="h4" component="h1" align="center">
            {selectedPaper.papertitle} Exam
          </Typography>
          <br></br>
          {renderSectionsAccordion()}
          <Typography variant="h5" component="p" align="center">
            <b>{questions[currentQuestion].section}</b>
          </Typography>
          <Typography variant="h6" component="p" align="center">
            (Marks: {questions[currentQuestion].marks}, Negative Marks:{" "}
            {questions[currentQuestion].negativeMarks})
          </Typography>
          {/* <br /> */}
          <Typography variant="h6" component="h1" align="center">
            <p>
              Time: {minutes < 10 ? "0" + minutes : minutes}:
              {seconds < 10 ? "0" + seconds : seconds}
            </p>
          </Typography>
          <Box mt={4}>
            <Typography variant="body1" align="center" mb={2}>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            {renderQuestion(questions[currentQuestion])}
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                onClick={handlePreviousClick}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleNextClick}
                disabled={currentQuestion === questions.length - 1}
              >
                Next
              </Button>
            </Box>
            <Box mt={2} display="flex" justifyContent="center">
              {isLoading ? (
                <RingLoadingIcon /> // Render loading indicator if isLoading is true
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmitClick}
                >
                  Submit
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    )}
      <CustomDialog
        open={openConfirmationDialog}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmSubmit}
        title="Confirm Submission"
        message="Are you sure you want to submit?"
      />
      <div>
          <CustomDialog
            open={openDialog}
            onClose={handleCloseConfirmationDialog}
            onConfirm={handleCloseConfirmationDialog} // Close the dialog when OK button is clicked
            title={dialogTitle}
            message={dialogMessage}
            showOnlyOkButton={true}
          />
        </div>
    </Container>
  );
};
export default ExamPage;
