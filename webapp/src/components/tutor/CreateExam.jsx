import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Container,
  CircularProgress,
} from "@mui/material";
import { createExam, getCategories, getSubcategories } from "../../services";
import { useNavigate } from "react-router-dom";
import {
  hardcodedCategories,
  hardcodedSubcategories,
} from "../common/CommonDataAndRules/ExamCategories"; // Import constants
import ConfirmationDialog from "../common/ConfirmationDialog";

const CreateExam = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // State variable for loading indicator

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [allocatedTime, setAllocatedTime] = useState("");
  const [examPrice, setExamPrice] = useState("");
  const [examId, setExamId] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [subcategoriesLevel2, setSubcategoriesLevel2] = useState([]);
  const [selectedSubcategoryLevel2, setSelectedSubcategoryLevel2] = useState("");

  const [selectedDifficultyLevel, setselectedDifficultyLevel] = useState("");
  //  const [sections, setSections] = useState([{}]);

  const [sections, setSections] = useState([
    {
      name: "Main Section",
      marks: "",
      negativeMarks: "", // Add negativeMarks property
    },
  ]);

  useEffect(() => {
    // Fetch categories when the component mounts
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.categories);
        //The below is dummy statement. To be used to prevent ESLint thoring error as the api is not built yet
        if (categories.length < 0) {
          logger.log("In Webapp useEffect. categories is -->> ", categories);
        }
        //#PROD logger.log("In Webapp useEffect. categories is -->> ", categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    let x = 1;
    if (x == 0) {
      fetchCategories();
      //#PROD logger.log("In Webapp useEffect. Calling fetchCategories API....");
    } else {
      setCategories(hardcodedCategories);
    }
  }, []);

  const handleCategoryChange = async (category) => {
    // Fetch subcategories based on the selected category
    try {
      let x = 1;
      if (x == 0) {
        const response = await getSubcategories(category);
        setSubcategories(response.data.subcategories);
      }
      setSubcategories(hardcodedSubcategories[category]); //Hardcoded values for the time being
      setSelectedCategory(category);

      setSelectedSubcategory(""); // Reset Subcategory when Category changes
      setSelectedSubcategoryLevel2(""); // Reset Subcategory Level 2 when Category changes

      // Use the hardcodedSubcategories object or fetch data from an API
      const subcategoriesForCategory = hardcodedSubcategories[category];
      // Update the state for Subcategories
      setSubcategories(Object.keys(subcategoriesForCategory));

      // setSelectedSubcategory("");
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  // Update the handleSubcategoryChange function to handle Subcategory change
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedSubcategoryLevel2(""); // Reset Subcategory Level 2 when Subcategory changes
    // Handle logic to fetch Subcategories Level 2 based on the selected Subcategory if needed
    // Use the hardcodedSubcategories object or fetch data from an API
    const subcategoriesLevel2ForSubcategory =
      hardcodedSubcategories[selectedCategory][subcategory];
    // Update the state for Subcategories Level 2
    setSubcategoriesLevel2(subcategoriesLevel2ForSubcategory);
  };

  // Update the handleSubcategoryLevel2Change function to handle Subcategory Level 2 change
  const handleSubcategoryLevel2Change = (subcategoryLevel2) => {
    setSelectedSubcategoryLevel2(subcategoryLevel2);
  };

  const handleAddSection = () => {
    if (sections.length < 10) {
      setSections([...sections, { name: "", marks: "", negativeMarks: "" }]);
    } 
    if (sections.length === 9) {
      setDialogTitle("Maximum Sections Reached");
      setDialogMessage("Maximum 10 Sections are allowed. Please contact the admin team if you need more than 10 sections for any exam.");
      setDialogOpen(true);
    }
  };

  const handleDeleteSection = (indexToDelete) => {
    setSections((prevSections) => {
      return prevSections.filter((section, index) => index !== indexToDelete);
    });
  };

  // add form submission handling here
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate examPrice to ensure it's a number
    if (isNaN(Number(numQuestions))) {
      setDialogTitle("Validation Error!!");
      setDialogMessage("Number of Questions must be a number.");
      setDialogOpen(true);
      //      alert("Number of Questions must be a number.");
      setLoading(false); // Reset loading state
      return;
    }
    // Validate examPrice to ensure it's a number
    if (isNaN(Number(allocatedTime))) {
      setDialogTitle("Validation Error!!");
      setDialogMessage("Alllocated Time must be a number.");
      setDialogOpen(true);
      //      alert("Alllocated Time must be a number.");
      setLoading(false); // Reset loading state
      return;
    }
    // Validate examPrice to ensure it's a number
    if (isNaN(Number(examPrice))) {
      setDialogTitle("Validation Error!!");
      setDialogMessage("Exam Price must be a number.");
      setDialogOpen(true);
      //        alert("Exam Price must be a number.");
      setLoading(false); // Reset loading state
      return;
    }
    // Validate sections to ensure name and marks are filled
        // Validate sections to ensure name and marks are filled
        if (sections.length === 0) {
          setDialogTitle("Validation Error!!");
          setDialogMessage("At least one section is required.");
          setDialogOpen(true);
          setLoading(false); // Reset loading state
          return;
        }
    for (const section of sections) {
      if (!section.name || !section.marks) {
        setDialogTitle("Validation Error!!");
        setDialogMessage("Section Name and Marks are mandatory for all sections.");
        setDialogOpen(true);
        setLoading(false); // Reset loading state
        return;
      }
    }
    setLoading(true); // Set loading state to true when form is submitted
    // add form validation and error handling here

    // Prepare section data
    const sectionsData = sections.map((section, index) => ({
      name: section.name || `Section ${index + 1}`,
      marks: section.marks || 0,
      negativeMarks: section.negativeMarks || 0, // Include negativeMarks property
    }));

    const examData = {
      examTitle,
      examDescription,
      numQuestions,
      allocatedTime,
      examPrice,
      selectedCategory,
      selectedSubcategory,
      selectedSubcategoryLevel2,
      selectedDifficultyLevel,
      sections: sectionsData, // Include section data in examData
    };
    logger.log("examData is -->> ", examData);
    try {
      // submit examData to the server using an API call or another method
      // assuming the server returns a response with the exam ID
      const response = await createExam(examData);
      logger.log("In CreateExam response after creating exam is -> response", response);
      setExamId(response.data);
      setDialogTitle("Success");
      setDialogMessage(
        "Exam Created Successfully. You can view the exam in My Papers and add questions."
      );
      setDialogOpen(true);
      //      alert("Exam Created Successfully");
      // if (response.data.paperid) {
      //   navigate("/submittedpapers");
      // }
    } catch (error) {
      console.error("Error creating exam:", error);
    } finally {
      setLoading(false); // Reset loading state when API call is complete
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogTitle === "Success" && examId) {
      navigate("/submittedpapers");
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "0rem" }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        Create Exam
      </Typography>
      <Box sx={{ padding: 0 }}>
{/*
        {examId && (
          <Box sx={{ marginBottom: 4 }}>
            <Typography variant="h6">
              Exam Created Successfully! Exam ID: {examId}
            </Typography>
            <Typography variant="body1">
              Exam Title: {examTitle} | Number of Questions: {numQuestions} |
              Allocated Time: {allocatedTime} minutes | Exam Price: {examPrice}
            </Typography>
          </Box>
        )}
        */}        
        <Paper sx={{ padding: 4 }}>
          {/* <Typography variant="h4" sx={{ marginBottom: 2 }}>
            Create Exam
          </Typography> */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    {Object.keys(hardcodedSubcategories).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={selectedSubcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    disabled={!selectedCategory}
                  >
                    {subcategories.map((subcategory) => (
                      <MenuItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Subcategory Level 2</InputLabel>
                  <Select
                    value={selectedSubcategoryLevel2}
                    onChange={(e) =>
                      handleSubcategoryLevel2Change(e.target.value)
                    }
                    disabled={!selectedSubcategory}
                  >
                    {subcategoriesLevel2.map((subcategoryLevel2) => (
                      <MenuItem
                        key={subcategoryLevel2}
                        value={subcategoryLevel2}
                      >
                        {subcategoryLevel2}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={selectedDifficultyLevel}
                    onChange={(e) => setselectedDifficultyLevel(e.target.value)}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Expert">Expert</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={12}>
                <TextField
                  fullWidth
                  required
                  label="Exam Title"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Exam Description"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Number of Questions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Allocated Time (in minutes)"
                  value={allocatedTime}
                  onChange={(e) => setAllocatedTime(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Exam Price"
                  value={examPrice}
                  onChange={(e) => setExamPrice(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                {/* Section fields */}
                {sections.map((section, index) => (
                  <Grid
                    container
                    spacing={3}
                    key={index}
                    sx={{ marginBottom: "16px" }}
                  >
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        required
                        label={`Section ${index + 1} Name`}
                        value={section.name || ""}
                        onChange={(e) =>
                          setSections((prevSections) => {
                            const updatedSections = [...prevSections];
                            updatedSections[index].name = e.target.value;
                            return updatedSections;
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        required
//                        label={`Section ${index + 1} Marks / Question`}
                        label={`Marks per Question`}
                        value={section.marks || ""}
                        onChange={(e) =>
                          setSections((prevSections) => {
                            const updatedSections = [...prevSections];
                            updatedSections[index].marks = e.target.value;
                            return updatedSections;
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
//                        label={`Section ${index + 1} Negative Marks`} // Label for negative marks
                        label={`Negative Marks per Question`} // Label for negative marks
                        value={section.negativeMarks || ""} // Value for negative marks
                        onChange={(e) =>
                          setSections((prevSections) => {
                            const updatedSections = [...prevSections];
                            updatedSections[index].negativeMarks =
                              e.target.value;
                            return updatedSections;
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteSection(index)}
                        disabled={sections.length <= 1} // Disable delete button if there is only one section
                      >
                        Delete
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSection}
                  disabled={sections.length >= 10} // Disable the button when sections array length is 10 or more
                >
                  Add Section
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {loading ? ( // Conditional rendering based on loading state
                    <CircularProgress size={24} color="inherit" /> // Display loading indicator
                  ) : (
                    "Create Exam" // Display button text
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose} // Close the dialog when OK button is clicked
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true} // Show only the OK button
      />
    </Container>
  );
};

export default CreateExam;
