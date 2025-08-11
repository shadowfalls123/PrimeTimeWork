import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Button,
  FormControlLabel,
  Radio,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import { useLocation } from "react-router-dom";
import {
  updateQuestion,
  getSPQuestions,
  publishExam,
  getQuestionImage,
} from "../../services";
import { RingLoadingIcon } from "../common/LoadingIcon";
import { useNavigate } from "react-router-dom";
import { addQuestioncharacterLimits } from "../common/CommonDataAndRules/LimitsAndRules"; // Import character limits
import RichTextEditor from "./RichTextEditor";
import { splitTextAndImageData } from '../../util/splitDataAndImages';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  button: {
    padding: "4px 8px", // Adjust padding to reduce button size
    minWidth: "unset", // Remove minimum width to allow smaller button size
    fontSize: "0.7rem", // Adjust font size to make the text smaller
  },
}));

const ReviewQuestions = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPaper = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined

  if (!selectedPaper) {
    return <div>Loading...</div>; // or handle other cases where result is null/undefined
  }
  const paper = selectedPaper;
  // logger.log("paper -> ", paper);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedOption, setSelectedOption] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [spQuestionsData, setSpQuestionsData] = useState({});
  const [answerExplanation, setAnswerExplanation] = useState("");
  const [questionID, setQuestionID] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [errors, setErrors] = useState({});
  const [paperid, setPaperId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publishExamConfirmDialogOpen, setPublishExamConfirmDialogOpen] = useState(false);
  const [publishSuccessExamDialogOpen, setPublishExamSuccessDialogOpen] = useState(false);
  const [publishErrorExamDialogOpen, setPublishErrorDialogOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State to track the current question index
  const [editMode, setEditMode] = useState(false); // State to track if edit mode is active
  const [questionImage, setQuestionImage] = useState(false);
  const [ansExpImage, setAnsExpImage] = useState(false);
  const [optionImages, setOptionImages] = useState(false);
  const currentQuestion = spQuestionsData[currentQuestionIndex]; // Replace 'spQuestionsData' with your actual data
  
  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAddQuestion = () => {
    navigate("/addquestions", { state: { paper } });
  };

  const handlePublishExam = async () => {
    try {
      logger.log("spQuestionsData -->> ", spQuestionsData);
    //  setPublishExamSuccessDialogOpen(true);      
      setPublishExamConfirmDialogOpen(false);
      setIsLoading(true);
      await publishExam(paper, spQuestionsData); // Pass marks and negativeMarks to the API
      setIsLoading(false);
      setPublishExamSuccessDialogOpen(true);
    } catch (err) {
      // Error handling
      setErrors([err]);
      setIsLoading(false);
      setPublishErrorDialogOpen(true);
      logger.log("Error publishing exam: ", err);
    }
  };

  const navigateToSubmittedPapers = async () => {
    setPublishExamSuccessDialogOpen(false);
    navigate("/submittedpapers");
  };

  const handleNext = () => {
    if (currentQuestionIndex < spQuestionsData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setEditMode(false); // Disable edit mode when moving to the next question
      setQuestionImage(null); // Reset image when moving to the next question
      setAnsExpImage(null);
      setOptionImages("");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setEditMode(false); // Disable edit mode when moving to the previous question
      setQuestionImage(null); // Reset image when moving to the next question
      setAnsExpImage(null);
      setOptionImages("");
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false); // Disable edit mode
    setSelectedOption(""); // Reset the selected option
    // Reset form fields to their original values
    setQuestion(currentQuestion ? currentQuestion.qtxt : "");
    // setOptions(
    //   currentQuestion
    //     ? [
    //         currentQuestion.op1,
    //         currentQuestion.op2,
    //         currentQuestion.op3,
    //         currentQuestion.op4,
    //         currentQuestion.op5,
    //       ]
    //     : ["", "", "", "", ""]
    // );
    setOptions(
      currentQuestion
        ? [
            currentQuestion.op1,
            currentQuestion.op2,
            currentQuestion.op3,
            currentQuestion.op4,
            currentQuestion.op5,
          ].slice(0, numberOfOptions) // Ensure we only keep required options
        : Array(numberOfOptions).fill("")
    );
    setAnswerExplanation(currentQuestion ? currentQuestion.explanation : "");
    setQuestionID(currentQuestion ? currentQuestion.quesid : "");
    //    setSelectedSection(currentQuestion ? currentQuestion.section : "");
    setPaperId(currentQuestion ? currentQuestion.pid : "");
  };

  const validateForm = () => {
    const newErrors = {};
    logger.log("question is -->> ", question);

    // Function to remove HTML tags
    const stripHTMLTags = (html) => {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    };

    // Check if the question is empty after stripping HTML tags
    const isQuestionEmpty = stripHTMLTags(question).trim().length === 0;

    // logger.log("question.length -->> ", question.length);
    // logger.log("options[0].length -->> ", options[0].length);
    // logger.log("options[1].length -->> ", options[1].length);
    // logger.log("options[2].length -->> ", options[2].length);
    // logger.log("options[3].length -->> ", options[3].length);
    // logger.log("answerExplanation.length -->> ", answerExplanation.length);

    // logger.log("question -->> ", question);
    // logger.log("options[0] -->> ", options[0]);
    // logger.log("options[1] -->> ", options[1]);

    // logger.log("options[2] -->> ", options[2]);

    // logger.log("options[3] -->> ", options[3]);
    // logger.log("answerExplanation -->> ", answerExplanation);


    // Validate question
    if (
      isQuestionEmpty ||
      question.length > addQuestioncharacterLimits.question
    ) {
      newErrors.question = `Question is required and must be less than ${addQuestioncharacterLimits.question} characters`;
    }

    // Ensure we only validate the required number of options
    const validOptions = options.slice(0, numberOfOptions);

    // Validate options
    if (
      validOptions.some(
        (option) => !option || option.length > addQuestioncharacterLimits.option
      )
    ) {
      logger.log("options -->> ", validOptions);
      newErrors.options = `Options text is required and must be less than ${addQuestioncharacterLimits.option} characters`;
    }

    // Validate selected option
    if (!selectedOption) {
      newErrors.selectedOption = "Please select correct answer";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Modify the isCorrectAnswer function
  const isCorrectAnswer = (optionIndex) => {
    const correctAnswerIndex = getCorrectOptionIndex();
    return correctAnswerIndex === optionIndex;
  };

  // Helper function to get the correct option index for a given question
  const getCorrectOptionIndex = () => {
    return currentQuestion.ans;
  };

  const handleRadioOptionChange = (event) => {
    const selectedOptionValue = event.target.value;
    setSelectedOption(selectedOptionValue);

    const optionIndex = parseInt(selectedOptionValue.slice(2), 10);
    const selectedOptionTxt = options[optionIndex - 1];
    const updatedOptions = options.map((option, index) => {
      if (index === optionIndex - 1) {
        return selectedOptionTxt;
      }
      return option;
    });

    setOptions(updatedOptions);
  };

  useEffect(() => {
    if (editMode) {
      logger.log("in ReviewQuestion selectedPaper is -->> ", selectedPaper);
      // When entering edit mode, set the values of question, options, selectedOption, answerExplanation
      setQuestion(currentQuestion ? currentQuestion.qtxt : "");
      // setOptions(
      //   currentQuestion
      //     ? [
      //         currentQuestion.op1,
      //         currentQuestion.op2,
      //         currentQuestion.op3,
      //         currentQuestion.op4,
      //         currentQuestion.op5,
      //       ]
      //     : ["", "", "", "", ""]
      // );
      setOptions(
        currentQuestion
          ? [
              currentQuestion.op1,
              currentQuestion.op2,
              currentQuestion.op3,
              currentQuestion.op4,
              currentQuestion.op5,
            ].slice(0, numberOfOptions) // Only take the required options
          : Array(numberOfOptions).fill("")
      );
      setAnswerExplanation(currentQuestion ? currentQuestion.explanation : "");
      setQuestionID(currentQuestion ? currentQuestion.quesid : "");
      setPaperId(currentQuestion ? currentQuestion.pid : "");
      setSelectedSection(currentQuestion ? currentQuestion.section : "");
      // Set the selected option based on the correct answer index
      const ansIndex = currentQuestion.ans; // Index of the correct answer (0, 1, 2, or 3)
      setSelectedOption(`${ansIndex}`); // Increment by 1 to match the option format
    } else {
      setSelectedOption(""); // Reset the selected option when exiting edit mode
    }
  }, [editMode, currentQuestion]);

  // Place this useEffect hook outside your component
  useEffect(() => {
    // Remove the success message after 3 seconds
    const timer = setTimeout(() => {
      setErrors({ success: "" });
    }, 5000);

    return () => clearTimeout(timer); // Clear the timer when the component unmounts or when useEffect re-runs
  }, [errors.success]);

  useEffect(() => {
    setIsLoading(true);
    const CountOfQuestion = async () => {
      try {
        const response = await getSPQuestions(selectedPaper.pid);
        logger.log("ReviewQuestion response -> ", response);
        setQuestionCount(response.data);
        logger.log("ReviewQuestion questionCount -> ", questionCount);
        setSpQuestionsData(response.data);
        setIsLoading(false);
      } catch (err) {
        // Error handling
        setErrors([err]);
      }
    };

    // Call the function when the component mounts or when selectedPaper changes
    if (selectedPaper && selectedPaper.pid) {
      setSections(selectedPaper.sections);
      CountOfQuestion();
    }
  }, [selectedPaper.pid]); // Run this effect whenever selectedPaper changes

  // useEffect(() => {
  //   //#PROD logger.log("spQuestionsData updated:", spQuestionsData);
  //   // Rest of the useEffect logic
  // }, [spQuestionsData.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValidForm = validateForm();
    if (isValidForm) {
      setIsLoading(true); // Start loading
      try {
        const selectedSectionObj = sections.find(
          (section) => section.name === selectedSection
        );
        const marks = selectedSectionObj
          ? parseInt(selectedSectionObj.marks)
          : 0;
        const negativeMarks = selectedSectionObj
          ? parseInt(selectedSectionObj.negativeMarks)
          : 0;

        logger.log("[handleSubmit] ReviewQuestion selectedSection -->> ", selectedSection);
        logger.log("[handleSubmit] ReviewQuestion marks -->> ", marks);
        logger.log("[handleSubmit] ReviewQuestion negativeMarks -->> ", negativeMarks);
        logger.log("[handleSubmit] question -->> ", question);
        logger.log("[handleSubmit] options -->> ", options);
              // Use the utility function to process the question and options
      const { updatedQuestion, updatedOptions, updatedAnswerExplanation, combinedImages } = splitTextAndImageData(
        question,
        options,
        answerExplanation,
        questionImage,
        optionImages,
        ansExpImage
      );
      logger.log("[handleSubmit] updatedQuestion -->> ", updatedQuestion);
      logger.log("[handleSubmit] updatedOptions -->> ", updatedOptions);
      logger.log("[handleSubmit] updatedAnswerExplanation -->> ", updatedAnswerExplanation);
      logger.log("[handleSubmit] combinedImages -->> ", combinedImages);
      setOptionImages(combinedImages);
  // Update the question with new data
        await updateQuestion({
          updatedQuestion,
          updatedOptions,
          //         selectedOptionText,
          updatedAnswerExplanation,
          paperid,
          questionID,
          selectedOption,
          selectedSection,
          marks,
          negativeMarks,
          ...(Object.keys(combinedImages).length > 0 && { combinedImages }), // Conditionally include combinedImages if it has data
          //          selectedOption: selectedOptionIndex,
          // marks, // Include marks in the request payload
          // negativeMarks, // Include negativeMarks in the request payload
        });

        // **Update image states**
        setQuestionImage(combinedImages.questionImage || false);
        setAnsExpImage(combinedImages.ansExpImage || false);
        setOptionImages([
          combinedImages.option1Image || false,
          combinedImages.option2Image || false,
          combinedImages.option3Image || false,
          combinedImages.option4Image || false
        ]); 

        logger.log("before updating spQuestionsData -->> ", spQuestionsData);
        const updatedQuestionsData = [...spQuestionsData];
        const updatedQuestionIndex = currentQuestionIndex;

        updatedQuestionsData[updatedQuestionIndex] = {
          ...updatedQuestionsData[updatedQuestionIndex],
          qtxt: updatedQuestion,
          op1: updatedOptions[0] ?? "",
          op2: updatedOptions[1] ?? "",
          op3: updatedOptions[2] ?? "",
          op4: updatedOptions[3] ?? "",
          op5: updatedOptions[4] ?? "",
          ans: selectedOption.toString(),
          explanation: updatedAnswerExplanation,
          quesid: questionID,
          pid: paperid,
          section: selectedSection,
          marks: marks,
          negativeMarks: negativeMarks,
          image: combinedImages,
          hasImage: Object.keys(combinedImages).length > 0, // Add the hasImage flag
        };

        setSpQuestionsData(updatedQuestionsData);

        logger.log("after updating spQuestionsData -->> ", updatedQuestionsData);
        setErrors({ success: "Data Saved Successfully" });
       setEditMode(false); // Disable edit mode after submitting changes

        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors({ success: "" });
        }, 5000);
      } catch (err) {
        // Error handling
        setErrors([err]);
        console.error("Error saving data:", err);
      } finally {
        setIsLoading(false); // Stop loading after everything is done
      }
    } else {
      logger.log("Invalid Form Data");
    }
  };

  const handleShowImage = async (questionId) => {
    setIsLoading(true);
    if (questionImage || ansExpImage || optionImages.length > 0) {
      logger.log("Images already loaded. Skipping API call.");
      return; // Avoid unnecessary API calls
    }
    try {
      logger.log(
        "selectedPaper.pid, questionId --> ",
        selectedPaper.pid,
        questionId
      );
      logger.log("*** Getting images from server *** ")
      const response = await getQuestionImage(selectedPaper.pid, questionId); // Assuming getQuestionImage is a function that fetches the image
      const base64Image = response.data; // Assuming the response contains the base64 string in `response.data.imageUrl`
      let jsonbase64Image = JSON.parse(base64Image);
      logger.log(" jsonbase64Image -->> ", jsonbase64Image);
      if (jsonbase64Image) {
        // Check if each image is available in the response and set it accordingly
        if (jsonbase64Image.questionImage) {
          setQuestionImage(jsonbase64Image.questionImage);
        }

        if (jsonbase64Image.ansExpImage) {
              setAnsExpImage(jsonbase64Image.ansExpImage);
        }

        // Create an array of option images from jsonbase64Image
        const updatedOptionImages = [
          jsonbase64Image.option1Image,
          jsonbase64Image.option2Image,
          jsonbase64Image.option3Image,
          jsonbase64Image.option4Image,
          jsonbase64Image.option5Image,
        ];

        logger.log("updatedOptionImages -->>", updatedOptionImages);
        setOptionImages(updatedOptionImages);
      }

      //      setQuestionImage(base64Image); // Update based on the actual response
      // Delay the reset of isEditing and clearing success message
    } catch (error) {
      console.error("Failed to load image", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      // handleShowImage is only called if currentQuestion has images, and no images are loaded yet. Images are reset each time currentQuestion changes.
        if (currentQuestion.hasImage && !questionImage && !ansExpImage && !optionImages) {
        handleShowImage(currentQuestion.quesid);
      } else {
        // setQuestionImage(null);
        // setAnsExpImage(null);
        // setOptionImages("");
      }

      setQuestion(currentQuestion.qtxt || "");
      setAnswerExplanation(currentQuestion.explanation || "");
      setOptions([
        currentQuestion.op1 || "",
        currentQuestion.op2 || "",
        currentQuestion.op3 || "",
        currentQuestion.op4 || "",
        currentQuestion.op5 || "",
      ]);
      setSelectedOption(currentQuestion.correctOption?.toString() || "");
      setSelectedSection(currentQuestion.section || "");
      // setQuestionImage(null); // Reset question image when question changes
      // setAnsExpImage(null);
      // setOptionImages("");
    }
  }, [currentQuestion]);

  // Function to replace placeholders with images
  const replacePlaceholdersWithImages = (text = "", image, placeholder) => {
  //  logger.log("text, image, placeholder -> ", text, image, placeholder);
    if (image) {
      return text.replace(
        placeholder, 
        `<img src="${image}" alt="Option Image" style="max-width:100%; height:auto;" />`
      );
    }
    // logger.log("text.replace(placeholder, '') -->> ", text.replace(placeholder, ""));
    return text.replace(placeholder, ""); // Remove placeholder if no image
  };
  
  const questionType = "True or False....as of now this is dummy";
  const numberOfOptions = paper.subcategorylvl2 === "Hogan Personality Inventory" 
  ? 5 
  : questionType === "True and False"
    ? 2 
    : 4; // Default to 4 if no condition matches

const optionsArray = Array.from({ length: numberOfOptions }, (_, index) => index + 1);

const renderSectionsAccordion = () => {
  let globalQuestionNumber = 1; // Initialize global question number

  const sections = Array.from(new Set(spQuestionsData.map((question) => question.section))); // Get unique sections

  return (
    <Box mt={4}>
      {sections.map((section) => (
        <Accordion key={section}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section}-content`}
            id={`${section}-header`}
          >
            <Typography variant="h7">{section}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap="8px">
              {spQuestionsData
                .filter((q) => q.section === section) // Filter questions for the current section
                .map((question) => (
                  <Button
                    key={question.quesid}
                    variant="contained"
                    onClick={() =>
                      handleQuestionClick(
                        spQuestionsData.findIndex((q) => q.quesid === question.quesid)
                      )
                    }
                    className={classes.button}
                    style={{
                      marginRight: "8px",
                    }}
                  >
                    {globalQuestionNumber++} {/* Increment global question number */}
                  </Button>
                ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
    
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
            Exam Details
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Card variant="outlined" style={{ marginBottom: "0px" }}>
                <CardContent>
                  <Typography variant="h6" component="div" gutterBottom>
                    {paper.papertitle}
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    Exam Description: {paper.paperdesc}
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    Number of Questions: {paper.qcount}
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    Allocated Time: {paper.examtime}
                  </Typography>
                  <Typography variant="body1" component="div" gutterBottom>
                    Paper Price: {paper.price}
                  </Typography>
                  <br></br>
                  <br></br>
                  <Typography
                    variant="body1"
                    component="div"
                    fontSize={20}
                    gutterBottom
                  >
                    <b>Questions added till now: {spQuestionsData.length} </b>
                    {/* Display the count of questions here */}
                  </Typography>
                  <Grid item>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={handleAddQuestion}
                          disabled={
                            parseInt(spQuestionsData.length) >=
                            parseInt(paper.qcount)
                          }
                        >
                          Add New Question
                        </Button>
                      </Grid>
                      <Grid item>
                        {parseInt(spQuestionsData.length) >=
                          parseInt(paper.qcount) && (
                          <Button
                            variant="contained"
                            onClick={() =>
                              setPublishExamConfirmDialogOpen(true)
                            }
                          >
                            Publish Exam
                          </Button>
                        )}
                        <ConfirmationDialog
                          open={publishExamConfirmDialogOpen}
                          onClose={() => setPublishExamConfirmDialogOpen(false)}
                          onConfirm={handlePublishExam}
                          title="Publish Exam"
                          message='Exam will be published with the name you have set in "My Account". Are you sure you want to publish the exam ?'
                        />
                        <ConfirmationDialog
                          open={publishSuccessExamDialogOpen}
                          onClose={navigateToSubmittedPapers}
                          onConfirm={navigateToSubmittedPapers}
                          title="Success"
                          message="Exam published successfully"
                          showOnlyOkButton={true} // Show only the OK button
                        />
                        <ConfirmationDialog
                          open={publishErrorExamDialogOpen}
                          onClose={() => setPublishErrorDialogOpen(false)}
                          onConfirm={() => setPublishErrorDialogOpen(false)}
                          title="Error"
                          message="Error publishing Exam. Please contact support team"
                          showOnlyOkButton={true} // Show only the OK button
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            {spQuestionsData.length > 0 ? (
              <Grid item xs={12} md={9} style={{ display: "flex" }}>
                <Container
                  style={{
                    width: "100%",
                    paddingRight: "15px",
                    paddingLeft: "15px",
                  }}
                >
                  
                  <Typography variant="h6" gutterBottom>
                    Review Questions for &quot;{paper.papertitle}&quot;
                  </Typography>
                  {renderSectionsAccordion()}
                  <br />
                  {isLoading && (
                    <div>
                      {" "}
                      <RingLoadingIcon />
                    </div>
                  )}

                  <Typography variant="h6" gutterBottom>
                    Question {currentQuestionIndex + 1} of{" "}
                    {spQuestionsData.length}
                  </Typography>

                  {currentQuestion && (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={12}>
                          <FormControl fullWidth>
                            <InputLabel>Select Section</InputLabel>
                            <Select
                              //                              value={selectedSection}
                              value={
                                editMode
                                  ? selectedSection
                                  : currentQuestion.section
                              }
                              onChange={(e) =>
                                setSelectedSection(e.target.value)
                              }
                              displayEmpty
                              inputProps={{ "aria-label": "Select Section" }}
                              disabled={!editMode} // Disable input field if edit mode is not active
                            >
                              <MenuItem value="" disabled>
                                Select Section
                              </MenuItem>
                              {sections.map((section, index) => (
                                <MenuItem key={index} value={section.name}>
                                  {section.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={12}>
                          <Typography variant="body1" gutterBottom>
                            Question Text
                          </Typography>
                          <RichTextEditor
                            label="Question"
                            content={replacePlaceholdersWithImages(question, questionImage, `{questionImage}`)}
                            editMode={editMode}
                            //        onContentChange={setQuestion}
                            onContentChange={(newContent) =>
                              setQuestion(newContent)
                            }
                          //   onImageChange={setQuestionImage} // Ensure this is a function
                            error={!!errors.question}
                            helperText={errors.question}
                          />
                        </Grid>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            {optionsArray.map((optionIndex) => (
                              <Grid item xs={12} md={12} key={optionIndex}>
                                <Grid container spacing={2} alignItems="center">
                                  <Grid item xs={1} md={1}>
                                    <FormControlLabel
                                      value={`${optionIndex}`}
                                      control={<Radio />}
                                      label={null}
                                      disabled={!editMode}
                                      checked={
                                        editMode
                                          ? selectedOption === `${optionIndex}`
                                          : isCorrectAnswer(`${optionIndex}`)
                                      }
                                      onChange={handleRadioOptionChange}
                                    />
                                  </Grid>

                                  <Grid item xs={11} md={11}>
                                    <div
                                      style={{
                                        backgroundColor: isCorrectAnswer(
                                          optionIndex
                                        )
                                          ? "lightgreen"
                                          : "inherit",
                                      }}
                                    >

                                        <RichTextEditor
                                          label={`Option ${optionIndex}`}
                                          content={replacePlaceholdersWithImages(options[optionIndex - 1] || "", optionImages[optionIndex - 1], `{option${optionIndex}Image}`)}
                                          onContentChange={(newValue) => {
                                            logger.log(`Updated content for Option ${optionIndex}:`, newValue); // Log the updated content
                                            const updatedOptions = [...options];
                                            logger.log("updatedOptions --> ", updatedOptions);
                                            
                                            updatedOptions[optionIndex - 1] =
                                              newValue;
                                           // logger.log("updatedOptions[optionIndex - 1] -->> ", updatedOptions[optionIndex - 1]);  
                                            setOptions(updatedOptions);
                                          }}
                                          editMode={editMode}
                                          error={errors.options}
                                        />
                                    </div>

                                    {errors.options && (
                                      <div style={{ color: "red" }}>
                                        {errors.options}
                                      </div>
                                    )}
                                  </Grid>
                                </Grid>
                              </Grid>
                            ))}
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <RichTextEditor
                              label="Answer Explanation"
                              content={replacePlaceholdersWithImages(answerExplanation, ansExpImage, `{ansExpImage}`)}
//                              content={answerExplanation}
                              editMode={editMode}
                              onContentChange={setAnswerExplanation}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}

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
                      {!editMode ? (
                        <Button variant="contained" onClick={handleEdit}>
                          Edit
                        </Button>
                      ) : (
                        <Grid container spacing={2} justifyContent="center">
                          <Grid item>
                            <Button
                              variant="contained"
                              onClick={handleSubmit}
                              color="primary"
                              disabled={isLoading}
                            >
                              {isLoading ? "Saving..." : "Save"}
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button variant="contained" onClick={handleCancel}>
                              Cancel Edit
                            </Button>
                          </Grid>
                        </Grid>
                      )}
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
                  </Grid>
                </Container>
              </Grid>
            ) : (
              <Typography variant="h6" gutterBottom marginLeft={10}>
                <br></br>
                No Questions added for &quot;{paper.papertitle}&quot; yet.
                Nothing to review. Please add questions.{" "}
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
    
  );
};

export default ReviewQuestions;
