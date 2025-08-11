import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Grid,
  Typography,
  Container,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";
import { useLocation, useNavigate } from "react-router-dom";
import { addQuestion, getQuestionsCount } from "../../services";
import { addQuestioncharacterLimits } from "../common/CommonDataAndRules/LimitsAndRules"; // Import character limits
import RichTextEditor from "./RichTextEditor";

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%", // set the width to 100%
}));

const AddQuestions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPaper = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined

  if (!selectedPaper) {
    return <div>Loading...</div>; // or handle other cases where result is null/undefined
  }

  //#PROD logger.log(" AddQuestions selectedPaper -> ", selectedPaper);
  const paper = selectedPaper;

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedOption, setSelectedOption] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [answerExplanation, setAnswerExplanation] = useState("");
  const [errors, setErrors] = useState({});
  const [paperid, setPaperId] = useState("");
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [image, setImage] = useState(null);
  const questionsData = {
    question,
    options,
    selectedOption: selectedOption.toString(), // Use the selectedOption state directly
    answerExplanation,
    paperid,
    selectedSection,
    image, // Include the image in the question data
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate question
    if (!question || question.length > addQuestioncharacterLimits.question) {
      newErrors.question = `Question is required and must be less than ${addQuestioncharacterLimits.question} characters`;
    }

    // Validate options
    if (
      options.some(
        (option) => !option || option.length > addQuestioncharacterLimits.option
      )
    ) {
      newErrors.options = `Options text is required and must be less than ${addQuestioncharacterLimits.option} characters`;
    }

    // Validate selected option
    if (!selectedOption) {
      newErrors.selectedOption = "Please select the correct answer";
    }

    // // Validate answer explanation
    // if (!answerExplanation || answerExplanation.length > addQuestioncharacterLimits.answerExplanation) {
    //   newErrors.answerExplanation = `Answer explanation is required and must be less than ${addQuestioncharacterLimits.answerExplanation} characters`;
    // }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Inside handleRadioOptionChange function
  const handleRadioOptionChange = (event) => {
    const selectedOptionIndex = parseInt(event.target.value, 10); // Parse string to integer
    //#PROD logger.log("selectedOptionIndex -> ", selectedOptionIndex);
    setSelectedOption(selectedOptionIndex); // Set the selected index directly
    setPaperId(selectedPaper.pid);
  };
  // The below function is working with TextField
  // const handleOptionChange = (index, event) => {
  //    const newOptions = [...options];
  //   newOptions[index] = event.target.value;
  //   setOptions(newOptions);
  // };

  const handleOptionChange = (index, optionsHtmlContent) => {
    //    logger.log("index value is -->> ", index);
    //    logger.log("handleOptionChange htmlcontent -> ", optionsHtmlContent);
    const newOptions = [...options];
    //    newOptions[index] = event.target.value;
    newOptions[index] = optionsHtmlContent;
    setOptions(newOptions);
  };

  // const handleImageUpload = (event) => {
  //   const file = event.target.files[0];
  //   setImage(file);
  // };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result); // reader.result contains the Base64 encoded string
    };
    reader.readAsDataURL(file);
  };

  // Place this useEffect hook outside your component
  useEffect(() => {
    // Remove the success message after 3 seconds
    const timer = setTimeout(() => {
      setErrors({ success: "" });
    }, 5000);

    return () => clearTimeout(timer); // Clear the timer when the component unmounts or when useEffect re-runs
  }, [errors.success]);

  useEffect(() => {
    // Perform actions that depend on questionCount after it's updated
    // This effect runs when questionCount changes
    // You can add any code here that needs to be executed when questionCount changes
    //#PROD logger.log("Question count updated:", questionCount);
    // Perform any other necessary operations here
  }, [questionCount]); // The effect will re-run whenever questionCount changes

  useEffect(() => {
    const CountOfQuestion = async () => {
      try {
        //#PROD logger.log("selectedPaper.pid -> ", selectedPaper.pid);
        const response = await getQuestionsCount(selectedPaper.pid);
        // const successmsg = {};
        // successmsg.success = 'Data Saved Successfully';
        // setErrors(successmsg);
        setQuestionCount(response.data);
        //#PROD logger.log("response.questionsCount -> ", response.data);
      } catch (err) {
        // Error handling
        setErrors([err]);
      }
    };

    // Call the function when the component mounts or when selectedPaper changes
    if (selectedPaper && selectedPaper.pid) {
      logger.log("selectedPaper -> ", selectedPaper);
      setSections(selectedPaper.sections);
      if (selectedPaper.sections.length > 0) {
        setSelectedSection(selectedPaper.sections[0].name); // Set the first section as default
      }
      CountOfQuestion();
    }
  }, [selectedPaper.pid]); // Run this effect whenever selectedPaper changes

  const handleReviewQuestions = () => {
    //    setShowAddQuestion(true);
    //    //#PROD logger.log(showAddQuestion);
    navigate("/reviewquestions", { state: { paper } });
  };

  // Function to extract image data and replace the img tag with variable names
  function processQuestionData(data, imageType) {
    let images = {};
    //  let imageIndex = 1;

    // Extract base64 image data from the question
    //  let updatedQuestion = data.question.replace(/<img\s+src="([^"]+)"[^>]*>/g, (match, src) => {
    let updatedData = data.replace(
      /<img\s+src="([^"]+)"[^>]*>/g,
      (match, src) => {
        // Create a variable name for the image
        //    let imageVariableName = `questionImage${imageIndex}`;
        let imageVariableName = imageType;
        images[imageVariableName] = src; // Store the base64 image data
        //    imageIndex++; // Increment index for each image found
        return `{${imageVariableName}}`; // Replace <img> tag with variable name
      }
    );

    // // Add the updated question back to the data object
    // let updatedData = { ...data, question: updatedQuestion };

    // Return updated data and extracted images
    return { updatedData, images };
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValidForm = validateForm();
    if (isValidForm) {
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

        // Add the marks and negative marks to the questionsData object
        const updatedQuestionsData = {
          ...questionsData,
          marks: marks,
          negativeMarks: negativeMarks,
        };
        logger.log("updatedQuestionsData -> ", updatedQuestionsData);

        // Process the questionsData
        //let { updatedData, images } = processQuestionData(updatedQuestionsData.question, "questionImage");

        // Process the question data
        let { updatedData: updatedQuestion, images: questionImages } = processQuestionData(updatedQuestionsData.question, "questionImage");

        // // Output the updated data and extracted images
        // logger.log("Updated Data:", updatedData);
       logger.log("questionImages: ", questionImages);

        // updatedQuestionsData.image = images.questionImage;
        // updatedQuestionsData.question = updatedData;
        // logger.log ("updatedQuestionsData.image -- > ", updatedQuestionsData.image);

        logger.log("updatedQuestionsData -> ", updatedQuestionsData);

        // Process each option's data individually
        let processedOptions = updatedQuestionsData.options.map(
          (option, index) => {
            let { updatedData, images } = processQuestionData(
              option,
              `option${index + 1}Image`
            );
            return { updatedOption: updatedData, optionImages: images };
          }
        );

        answerExplanation
        
logger.log("updatedQuestionsData.answerExplanation -->> ", updatedQuestionsData.answerExplanation);

        // Process the AnswerExplaination data
        let { updatedData: updatedAnswerExplanation, images: ansExpImage } = processQuestionData(updatedQuestionsData.answerExplanation, "ansExpImage");

        logger.log("updatedAnswerExplanation -->> ", updatedAnswerExplanation);
        logger.log("ansExpImage --> ", ansExpImage);
        
       
        // Combine the extracted images from options and question
        let combinedImages = {
          ...questionImages,
          ...processedOptions.reduce(
            (acc, opt) => ({ ...acc, ...opt.optionImages }),
            {}
          ),
          ...ansExpImage,
        };

        // Update the questionsData with processed images and updated text
        updatedQuestionsData.question = updatedQuestion;
        updatedQuestionsData.options = processedOptions.map((opt) => opt.updatedOption);
        updatedQuestionsData.answerExplanation = updatedAnswerExplanation;
        updatedQuestionsData.images = combinedImages;

        logger.log("Final updatedQuestionsData -> ", updatedQuestionsData);
        logger.log("Extracted Images -> ", combinedImages);
  
        // Call the API to add the question with the updated data
        await addQuestion(updatedQuestionsData);

        // Update the count of questions by incrementing it
        //      setQuestionCount(prevCount => prevCount + 1);
        setQuestionCount((prevCount) => ({ count: prevCount.count + 1 }));

        // setQuestionCount(questionCount + 1);
        //#PROD logger.log("response.questionsCount -> ", questionCount);
        const successmsg = {};
        successmsg.success = "Data Saved Successfully";
        setErrors(successmsg);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setSelectedOption("");
        setAnswerExplanation("");
        setImage(null);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors({ success: "" });
        }, 5000);
      } catch (err) {
        // Error handling
        setErrors([err]);
      }
    } else {
      //#PROD logger.log("inValid FormData ");
    }
  };

  return (
    <Container
      maxWidth="xl"
      style={{ display: "flex", flexDirection: "column" }}
    >
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
                Allocated Time: {paper.examtime} mins
              </Typography>
              <Typography variant="body1" component="div" gutterBottom>
                Paper Price: ₹{paper.price}
              </Typography>
              <br></br>
              <br></br>
              <Typography
                variant="body1"
                component="div"
                gutterBottom
                fontSize={20}
              >
                <b>
                  Questions added till now:{" "}
                  {questionCount && questionCount.count}{" "}
                </b>
                {/* Display the count of questions here */}
              </Typography>
              <Grid item>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleReviewQuestions}
                      disabled={
                        parseInt(questionCount && questionCount.count) >=
                        parseInt(paper.qcount)
                      }
                    >
                      Add New Question
                    </Button>
                  </Grid>
                  <Grid item>
                    {parseInt(questionCount && questionCount.count) >=
                      parseInt(paper.qcount) && (
                      <Button
                        variant="contained"
                        onClick={handleReviewQuestions}
                      >
                        Review and Publish Exam
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9} style={{ display: "flex" }}>
          <Container
            style={{ width: "100%", paddingRight: "15px", paddingLeft: "15px" }}
          >
            {!(
              parseInt(questionCount && questionCount.count) >=
              parseInt(paper.qcount)
            ) ? (
              <Grid>
                <Typography variant="h5" gutterBottom>
                  Add Questions for &quot;{paper.papertitle}&quot;
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={12}>
                      <FormControl fullWidth>
                        <InputLabel>Select Section</InputLabel>
                        <Select
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          displayEmpty
                          inputProps={{ "aria-label": "Select Section" }}
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
                      <RichTextEditor
                        label="Question"
                        content={question}
                        editMode={true}
                        onContentChange={(htmlContent) =>
                          setQuestion(htmlContent)
                        }
                        //                      onImageChange={(imageUrls) => logger.log(imageUrls)} // Handle image URLs as needed
                        error={!!errors.question}
                        helperText={errors.question}
                      />
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {image && (
                        <Typography variant="body2">
                          Image selected: {image.name}
                        </Typography>
                      )}
                    </Grid>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12}>
                        <Grid item xs={12} md={12}>
                          <FormControl
                            component="fieldset"
                            style={{ marginBottom: "20px", width: "100%" }}
                          >
                            <Typography style={{ width: "10%", fontSize: 12 }}>
                              Correct Answer
                            </Typography>
                            <RadioGroup
                              style={{ marginBottom: "20px" }}
                              value={selectedOption}
                              onChange={handleRadioOptionChange}
                            >
                              {options.map((option, index) => (
                                <Grid
                                  container
                                  spacing={2}
                                  alignItems="center"
                                  key={index}
                                >
                                  <Grid item xs={1} md={1}>
                                    <FormControlLabel
                                      value={(index + 1).toString()} // Use index as the value instead of option text
                                      control={<Radio />}
                                      label={null}
                                      style={{
                                        width: "100%",
                                        marginRight: "100px",
                                      }}
                                    />
                                  </Grid>

                                  {/* <Grid item xs={12} md={12} key={index}> */}
                                  <Grid item xs={11} md={11} key={index}>
                                    <RichTextEditor
                                      label={`Option ${index + 1}`}
                                      content={option}
                                      editMode={true}
                                      onContentChange={(htmlContent) =>
                                        handleOptionChange(index, htmlContent)
                                      }
                                      //                                      onImageChange={(imageUrls) => logger.log(imageUrls)} // Handle image URLs as needed ...check if this is required
                                      error={!!errors.options}
                                      helperText={errors.options}
                                    />
                                  </Grid>
                                </Grid>
                              ))}
                            </RadioGroup>
                            {errors.selectedOption && (
                              <Typography color="error">
                                {errors.selectedOption}
                              </Typography>
                            )}
                            {errors.options && (
                              <Typography color="error">
                                {errors.options}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        {/* Rest of the code remains unchanged */}

                        <Grid item xs={12} md={12}>
                          {/* <Typography style={{ width: '10%', fontSize: 12, color: 'white'  }}>--------------------------</Typography> */}
                          <StyledTextField
                            label="Answer Explanation"
                            value={answerExplanation}
                            onChange={(e) =>
                              setAnswerExplanation(e.target.value)
                            }
                            fullWidth
                            multiline
                            rows={3}
                          />
                          {errors.answerExplanation && (
                            <Typography color="error">
                              {errors.answerExplanation}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} md={12}>
                          <RichTextEditor
                            label="Answer Explanation"
                            content={answerExplanation}
                            editMode={true}
                            onContentChange={(htmlContent) =>
                              setAnswerExplanation(htmlContent)
                            }
                            //                      onImageChange={(imageUrls) => logger.log(imageUrls)} // Handle image URLs as needed
                            error={!!errors.answerExplanation}
                            helperText={errors.answerExplanation}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={12}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      {/* Adjust the content to occupy full width */}
                      {errors.success && (
                        <Typography style={{ color: "green" }}>
                          {errors.success}
                        </Typography>
                      )}
                      {/* Adjust the content to occupy full width */}
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        color="primary"
                        style={{ width: "40%" }}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Grid>
            ) : (
              <Grid
                container
                direction="column"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  marginRight={5}
                  marginLeft={5}
                >
                  <br></br>
                  Required number of questions are added. Please review and
                  publish the exam.{" "}
                </Typography>
                <br></br>
                <Button variant="contained" onClick={handleReviewQuestions}>
                  Review and Publish Exam
                </Button>
              </Grid>
            )}
          </Container>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddQuestions;
