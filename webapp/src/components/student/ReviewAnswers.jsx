import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import { useLocation } from "react-router-dom";
import {
  Typography,
  Container,
  // Card,
  // CardContent,
  Grid,
  Button,
  FormControlLabel,
  Radio,
//  TextField,
  Card,
  CardContent,
  Divider,
  Box,
  Paper,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
//import { styled } from "@mui/system";
//import { useLocation } from "react-router-dom";
import { RingLoadingIcon } from "../common/LoadingIcon";
import { getSPQuestionsReviewAns, getMyExamReview } from "../../services";
//import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
// Import Certificate component from ExamsAreFun
import Certificate from "./Certificate";

const useStyles = makeStyles(() => ({
  button: {
    padding: "4px 8px", // Adjust padding to reduce button size
    minWidth: "unset", // Remove minimum width to allow smaller button size
    fontSize: "0.7rem", // Adjust font size to make the text smaller
  },
}));

// const StyledTextField = styled(TextField)(({ theme }) => ({
//   marginBottom: theme.spacing(2),
//   width: "100%", // set the width to 100%
// }));

const ReviewAnswers = () => {
  // Define useStyles hook to access custom styles
 const classes = useStyles();

  const location = useLocation();
  const { resultData, selectedPaper } = location.state; // pid and resultData is coming from Results display
  const { paper } = location.state; //paper is coming from MyCourses
  const selectedPack = location.state?.selectedPack || null; // selectedPack object
  
  // Set the initial paper state based on the available data
  const [newPaper, setNewPaper] = useState(paper || selectedPaper);





  // Update the paper state if it changes
  useEffect(() => {
    setNewPaper(paper || selectedPaper);
    logger.log("newPaper in useEffect", newPaper);
    logger.log("resultData in useEffect", resultData);
    logger.log("selectedPack is -->> ", selectedPack);
  }, [paper, selectedPaper]);

  const [pidCommon, setPidCommon] = useState(
    paper ? paper.pid : selectedPaper.pid
  ); 
  //If paper exists then use paper.pid coming from My courses else use pid coming from results display
  // const [resultDataCommon, setresultDataCommon] = useState(
  //   resultData.answers ? resultData.answers : []
  // );
  const [resultDataCommon, setresultDataCommon] = useState(
    resultData?.answers || []
  );
 
  const [historyResults, setHistoryResults] = useState([]);

  //  const [pidCommon, setPidCommon] = useState(paper && paper.length > 0 ? paper[0].pid : pid);

  const [spQuestionsData, setSpQuestionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State to track the current question index

  const currentQuestion = spQuestionsData[currentQuestionIndex]; // Replace 'spQuestionsData' with your actual data
  const [showCertificate, setShowCertificate] = useState(false); // State to manage certificate visibility

  // // Calculate overall percentage
  // const overallPercentage = ((historyResults.totalScore / historyResults.totalPossibleScore) * 100).toFixed(2);

  useEffect(() => {
    //#PROD logger.log("Fetching questions and student answers 1...................................................................");
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch student questions and answers only if resultDataCommon is not available (coming from MyCourses)
        if (
          !resultDataCommon ||
          (Array.isArray(resultDataCommon) &&
            resultDataCommon.length === 0 &&
            pidCommon)
        ) {
          //#PROD logger.log("Fetching student questions and answers 2...................................................................");
          const userExamResponse = await getMyExamReview(pidCommon);
          logger.log("userExamResponse -->> ", userExamResponse);
          setresultDataCommon(userExamResponse.examResults);
          setHistoryResults(userExamResponse.historyResults[0]);
          logger.log(
            "userExamResponse.historyResults -->> ",
            userExamResponse.historyResults
          );
        }
        // Fetch SP questions and answers
        const questionsResponse = await getSPQuestionsReviewAns(pidCommon, selectedPack.packid);
        logger.log("questionsResponse.data", questionsResponse.data);
        setSpQuestionsData(questionsResponse.data);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        //dummy usage of setPidCommon to handle  'setPidCommon' is assigned a value but never used  no-unused-vars
        if (!pidCommon) {
          setPidCommon("");
        }
        setIsLoading(false);
      }
    };

    // Trigger fetchData when pidCommon changes
    if (pidCommon) {
      fetchData();
    }
  }, [pidCommon, resultDataCommon]);

  // Modify the actualCorrectAnswer function
  const actualCorrectAnswer = (optionIndex) => {
    const correctAnswerIndex = getCorrectOptionIndex();
    return correctAnswerIndex === optionIndex;
    //  return resultDataCommon && resultDataCommon[`${currentQuestion.ans}`] === `${optionIndex}`;
  };

  // Modify the userSelectedAnswer function
  const userSelectedAnswer = (optionIndex) => {
    const userResponse = resultDataCommon.find(
      (response) => response.quesid === currentQuestion.quesid
    );
    // Add a null check before accessing selectedAns
    if (userResponse && userResponse.selectedAns) {
      return userResponse.selectedAns === `${optionIndex}`;
    }
    return false;
  };

  // Helper function to get the correct option index for a given question
  const getCorrectOptionIndex = () => {
    return currentQuestion.ans;
  };

  const handleNext = () => {
    if (currentQuestionIndex < spQuestionsData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      //      actualCorrectAnswer(currentQuestionIndex);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const toggleCertificate = () => {
    setShowCertificate((prevShowCertificate) => !prevShowCertificate);
  };

  const QuestionStatusIndicator = () => {
    // Get the current question
    const currentQuestion = spQuestionsData[currentQuestionIndex];

    // Find the user's response for the current question
    const userResponse = resultDataCommon.find(
      (response) => response.quesid === currentQuestion.quesid
    );

    // Check if the current question is answered correctly
    const isCorrect = resultDataCommon.find(
      (response) =>
        response.quesid === currentQuestion.quesid &&
        response.selectedAns === `${currentQuestion.ans}`
    );

    // Define the color based on whether the answer is correct
    const color = isCorrect ? "green" : "red";

    // Calculate marks obtained for the question
    const marksObtained = isCorrect
      ? currentQuestion.marks
      : currentQuestion.negativeMarks;

    // Display tick if the current question is answered correctly, otherwise display cross
    return (
      <span style={{ color }}>
        Your Answer = Option{" "}
        {userResponse && userResponse.selectedAns
          ? userResponse.selectedAns
          : "Not answered"}{" "}
        {isCorrect ? "✔" : "✘"}
        <br></br>
        Marks Scored: {marksObtained}
      </span>
    );
  };

  // // Function to render question buttons with status indicator
  // const renderQuestionButtons = () => {
  //   return spQuestionsData.map((question, index) => {
  //     const isCorrect = resultDataCommon.find(
  //       (response) =>
  //         response.quesid === question.quesid &&
  //         response.selectedAns === `${question.ans}`
  //     );
  //     const buttonColor = isCorrect ? "success" : "error";
  //     return (
  //       <Button
  //         key={index}
  //         variant="contained"
  //         color={buttonColor}
  //         onClick={() => setCurrentQuestionIndex(index)}
  //         //          size="small" // Set the size to "small" to reduce button size
  //         //          disabled={index === currentQuestionIndex}
  //         className={classes.button} // Apply custom button styles
  //         style={{ marginRight: "8px" }} // Add some margin between buttons
  //       >
  //         {index + 1}
  //       </Button>
  //     );
  //   });
  // };

  // const renderSectionedQuestionButtons = () => {
  //   // Assuming each question in spQuestionsData has a `section` field
  //   const sections = spQuestionsData.reduce((acc, question, index) => {
  //     const section = question.section || "General"; // Default to 'General' if no section is specified
  //     if (!acc[section]) {
  //       acc[section] = [];
  //     }
  //     acc[section].push({ ...question, index });
  //     return acc;
  //   }, {});
  
  //   return Object.entries(sections).map(([section, questions]) => (
  //     <div key={section} style={{ marginBottom: "16px" }}>
  //       <Typography variant="h6" gutterBottom>
  //         {section}
  //       </Typography>
  //       <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
  //         {questions.map((question) => {
  //           const isCorrect = resultDataCommon.find(
  //             (response) =>
  //               response.quesid === question.quesid &&
  //               response.selectedAns === `${question.ans}`
  //           );
  //           const buttonColor = isCorrect ? "success" : "error";
  //           return (
  //             <Button
  //               key={question.index}
  //               variant="contained"
  //               color={buttonColor}
  //               onClick={() => setCurrentQuestionIndex(question.index)}
  //               className={classes.button}
  //               style={{ marginRight: "8px" }}
  //             >
  //               {question.index + 1}
  //             </Button>
  //           );
  //         })}
  //       </div>
  //     </div>
  //   ));
  // };
  
  // Replace renderQuestionButtons() call in JSX with renderSectionedQuestionButtons()

  const renderSectionedQuestionButtonsWithAccordion = () => {
    const sections = spQuestionsData.reduce((acc, question, index) => {
      const section = question.section || "General"; // Default to 'General' if no section is specified
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push({ ...question, index });
      return acc;
    }, {});
  
    return Object.entries(sections).map(([section, questions]) => (
      <Accordion key={section}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{section}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {questions.map((question) => {
              const isCorrect = resultDataCommon.find(
                (response) =>
                  response.quesid === question.quesid &&
                  response.selectedAns === `${question.ans}`
              );
              const buttonColor = isCorrect ? "success" : "error";
              return (
                <Button
                  key={question.index}
                  variant="contained"
                  color={buttonColor}
                  onClick={() => setCurrentQuestionIndex(question.index)}
                  className={classes.button} // Apply custom button styles
                  style={{ marginRight: "8px" }} // Add some margin between buttons
                >
                  {question.index + 1}
                </Button>
              );
            })}
          </div>
        </AccordionDetails>
      </Accordion>
    ));
  };

  // Calculate user's score
  const userScore = resultDataCommon.reduce((score, response) => {
    const question = spQuestionsData.find(
      (question) => question.quesid === response.quesid
    );

    if (question) {
      // Check if the user's answer matches the correct answer
      if (response.selectedAns === `${question.ans}`) {
        // If the answer is correct, add the marks
        return score + question.marks;
      } else {
        // If the answer is incorrect, deduct the negative marks
        return score + question.negativeMarks;
      }
    }
    return score;
  }, 0);

  return (
    <Container
      maxWidth="xl"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {isLoading ? (
        <div>
          {" "}
          <RingLoadingIcon />
        </div>
      ) : (
        <Grid>
          <Typography variant="h5" gutterBottom>
            Exam Review: {newPaper.papertitle}{" "}
            {resultDataCommon && resultDataCommon.quesid}
          </Typography>
          {historyResults && Object.keys(historyResults).length > 0 ? ( // Check if historyResults is truthy and not an empty object
          <>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" component="h2" mb={2}>
                Results
              </Typography>
              <Typography variant="body1" mb={2}>
                <b>You Scored:</b> {historyResults.totalScore} out of{" "}
                {historyResults.totalPossibleScore} marks
                {/* <b>{overallPercentage}%</b>) */}
              </Typography>

              <Typography variant="body1" mb={2}>
                <b>You attempted:</b>{" "}
                {historyResults.totalQuestions -
                  historyResults.totalUnansweredQuestions}{" "}
                out of {historyResults.totalQuestions} questions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" mb={2}>
                <b>Section Wise Scores:</b>
              </Typography>
              {Object.entries(historyResults.sectionWiseScores).map(
                ([section, score], index) => {
                  // Calculate section-wise percentage
                  const sectionPercentage = (
                    (score /
                      historyResults.sectionWiseTotalPossibleScores[section]) *
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
                        {historyResults.sectionWiseTotalPossibleScores[section]}{" "}
                        (<b>{sectionPercentage}%</b>)
                      </Typography>
                      <Typography variant="body2">
                        (Total Questions:{" "}
                        {historyResults.sectionWiseQuestionCount[section]})
                      </Typography>
                    </Box>
                  );
                }
              )}
              <Divider sx={{ mb: 2 }} />
              {Object.values(
                historyResults.sectionWiseUnansweredQuestions
              ).some((count) => count > 0) && (
                <Typography variant="body1" mb={2}>
                  <b>Section Wise Unanswered Questions:</b>
                </Typography>
              )}
              {Object.entries(
                historyResults.sectionWiseUnansweredQuestions
              ).map(
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
                        <b>{section}:</b> {unansweredQuestions} unanswered
                        questions
                      </Typography>
                    </Box>
                  )
              )}
            </CardContent>
          </Card>
          </>
             ) : (
              <Typography variant="body1" mb={2}>
                No results available
              </Typography>
            )}
          <Typography variant="h6" gutterBottom>
            Exam Score: {userScore} / {spQuestionsData.length}
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={9} style={{ display: "flex" }}>
              <Container
                style={{
                  width: "100%",
                  paddingRight: "15px",
                  paddingLeft: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", marginLeft: "8px" }}>
                    <div
                      style={{
                        border: "2px solid lightblue",
                        borderRadius: "8px",
                        padding: "8px",
                        marginBottom: "16px",
                      }}
                    >
                                            {/* {renderQuestionButtons()} */}
                      {/* {renderSectionedQuestionButtons()} */}
                      {renderSectionedQuestionButtonsWithAccordion()}
                      
                    </div>
                  </div>
                  <br></br>

                  <Typography variant="h6" gutterBottom>
                    Question {currentQuestionIndex + 1} of {" "}
                    {spQuestionsData.length}
                  </Typography>
                  {/* Render question buttons */}
                </div>
                
                
                {currentQuestion && (
  <>
    {/* Render Question */}
    <Paper elevation={3} style={{ padding: "16px", marginBottom: "24px" }}>
      <Typography variant="h6" gutterBottom>
        Question {currentQuestionIndex + 1} of {spQuestionsData.length}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Question:
      </Typography>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
        }}
        dangerouslySetInnerHTML={{ __html: currentQuestion.qtxt }}
      />
    </Paper>

    {/* Render options with labels along the border */}
    <Grid container spacing={2}>
      {[1, 2, 3, 4].map((optionIndex) => (
        <Grid item xs={12} md={6} key={optionIndex}>
          <div style={{ position: "relative", marginBottom: "32px" }}>
            {/* Adjust label positioning with higher "top" and additional margin */}
            <span
              style={{
                position: "absolute",
                top: "-20px", // Move the label higher
                left: "16px",
                backgroundColor: "white",
                padding: "0 6px",
                fontWeight: "bold",
                fontSize: "0.9rem",
                color: "#333",
                zIndex: 1, // Ensure label is on top
              }}
            >
              Option {optionIndex}
            </span>
            <Paper
              elevation={1}
              style={{
                backgroundColor: actualCorrectAnswer(`${optionIndex}`)
                  ? "#d0f0c0" // light green for correct answer
                  : userSelectedAnswer(`${optionIndex}`) &&
                    userSelectedAnswer(`${optionIndex}`) !==
                      actualCorrectAnswer(`${optionIndex}`)
                  ? "#ff6666" // light red for incorrect answer
                  : "#f9f9f9", // default background
                color: userSelectedAnswer(`${optionIndex}`) &&
                  userSelectedAnswer(`${optionIndex}`) !==
                    actualCorrectAnswer(`${optionIndex}`)
                  ? "white"
                  : "inherit",
                borderRadius: "8px",
                padding: "16px", // Add extra padding to make room for label
                position: "relative",
                marginTop: "12px", // Extra space between label and option box
              }}
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <FormControlLabel
                    value={`${optionIndex}`}
                    control={<Radio />}
                    label={null}
                    disabled={true}
                    checked={actualCorrectAnswer(`${optionIndex}`)}
                  />
                </Grid>
                <Grid item xs>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion[`op${optionIndex}`],
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </div>
        </Grid>
      ))}
    </Grid>

    {/* Render Answer Explanation */}
    <Paper
      elevation={2}
      style={{
        marginTop: "24px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        Explanation:
      </Typography>
      <div
        dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
      />
    </Paper>
    
    <Grid item xs={12} md={9} style={{ display: "flex" }}>
                        <QuestionStatusIndicator />
                      </Grid>
  </>
)}



                {/* {currentQuestion && (
                  <>
                    <StyledTextField
                      label="Question"
                      value={currentQuestion.qtxt}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={true} // Disable input field if edit mode is not active
                    />

                    // Fields for options with radio buttons
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        {[1, 2, 3, 4].map((optionIndex) => (
                          <Grid item xs={12} md={12} key={optionIndex}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={1} md={1}>
                                <FormControlLabel
                                  value={`${optionIndex}`}
                                  control={<Radio />}
                                  label={null}
                                  disabled={true}
                                  checked={actualCorrectAnswer(
                                    `${optionIndex}`
                                  )}
                                  // checked={
                                  //   actualCorrectAnswer(`${optionIndex}`)
                                  // }
                                  onChange={() => {}}
                                />
                              </Grid>
                              <Grid item xs={11} md={11}>
                                <StyledTextField
                                  label={`Option ${optionIndex}`}
                                  value={currentQuestion[`op${optionIndex}`]}
                                  fullWidth
                                  disabled={true}
                                  style={{
                                    backgroundColor: actualCorrectAnswer(
                                      `${optionIndex}`
                                    )
                                      ? "lightgreen"
                                      : userSelectedAnswer(`${optionIndex}`)
                                      ? userSelectedAnswer(`${optionIndex}`) !==
                                        actualCorrectAnswer(`${optionIndex}`)
                                        ? "red"
                                        : //                                      ? "rgba(255, 99, 71, 1.0)"  // Light red color with lower opacity
                                          "inherit"
                                      : "inherit",
                                    color: userSelectedAnswer(`${optionIndex}`)
                                      ? userSelectedAnswer(`${optionIndex}`) !==
                                        actualCorrectAnswer(`${optionIndex}`)
                                        ? "white" // Change this to the desired text color when the answer is incorrect
                                        : "inherit"
                                      : "inherit",
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          label="Answer Explanation"
                          value={currentQuestion.explanation}
                          fullWidth
                          multiline
                          rows={9}
                          disabled={true} // Disable input field if edit mode is not active
                        />
                      </Grid>
                      <Grid item xs={12} md={9} style={{ display: "flex" }}>
                        <QuestionStatusIndicator />
                      </Grid>
                    </Grid>
                  </>
                )}
              */}




                <Grid container spacing={2} justifyContent="space-between">
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                  </Grid>

                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={
                        currentQuestionIndex === spQuestionsData.length - 1
                      }
                    >
                      Next
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" onClick={toggleCertificate}>
                      Certificate
                    </Button>
                  </Grid>
                  {/* Render the Certificate component conditionally */}
                  {/* {showCertificate && <Certificate />} */}
                  {showCertificate && (
                    <Certificate
                      studentName="John Doe"
                      subjectName={newPaper.papertitle}
                      score={userScore}
                      totalQuestions={spQuestionsData.length}
                    />
                  )}
                </Grid>
              </Container>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ReviewAnswers;
