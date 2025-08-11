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
import { getCategories, getSubcategories, updateExam } from "../../services";
import { useLocation, useNavigate } from "react-router-dom";
import { hardcodedCategories, hardcodedSubcategories } from "../common/CommonDataAndRules/ExamCategories"; // Import constants
import ConfirmationDialog from "../common/ConfirmationDialog";

const EditExam = () => {
  const location = useLocation();
  const paperData = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // State variable for loading indicator

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

//  const [paperData, setPaperData] = useState(location.state?.paper || {});
  const [updatedPaperData, setUpdatedPaperData] = useState(location.state?.paper || {});
  const [examTitle, setExamTitle] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [allocatedTime, setAllocatedTime] = useState("");
  const [examPrice, setExamPrice] = useState("");

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const [subcategoriesLevel2, setSubcategoriesLevel2] = useState([]);
  const [selectedSubcategoryLevel2, setSelectedSubcategoryLevel2] = useState("");

  const [selectedDifficultyLevel, setselectedDifficultyLevel] = useState("");
  const [sections, setSections] = useState([]);
  //const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.categories);
        //The below is dummy statement. To be used to prevent ESLint thoring error as the api is not built yet
        if (categories.length < 0) {
          logger.log("In Webapp useEffect. categories is -->> ", categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    let x = 1;
    if (x == 0) {
      fetchCategories();
      //#PROD logger.log("In Webapp useEffect. Calling fetchCategories API....");
    } else {
      //#PROD logger.log("paper is -->> ", paperData);
      setCategories(hardcodedCategories);
      // Initialize sections state with data from the paper
      setSections(paperData.sections || []);

      const subcategoriesForCategory = hardcodedSubcategories[paperData.category];
      // Update the state for Subcategories
      setSubcategories(Object.keys(subcategoriesForCategory));

      const subcategoriesLevel2ForSubcategory = hardcodedSubcategories[paperData.category][paperData.subcategory];
      // Update the state for Subcategories Level 2
      setSubcategoriesLevel2(subcategoriesLevel2ForSubcategory);

      setSelectedCategory(paperData.category); 
      setSelectedSubcategory(paperData.subcategory);
      setSelectedSubcategoryLevel2(paperData.subcategorylvl2);
      setselectedDifficultyLevel(paperData.difflvl);
      setExamTitle(paperData.papertitle);
      setExamDescription(paperData.paperdesc);
      setNumQuestions(paperData.qcount);
      setAllocatedTime(paperData.examtime);
      setExamPrice(paperData.price);
    }
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (paperData.selectedCategory) {
        try {
          const response = await getSubcategories(paperData.selectedCategory);
          setSubcategories(response.data.subcategories);
          //#PROD logger.log("subcategories -->> ", subcategories);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      }
    };
    fetchSubcategories();
  }, [paperData.selectedCategory]);


  const handleCancel = () => {
    navigate(-1);
  };

  const handleCategoryChange = (selectedcategory) => {
    //#PROD logger.log("category selected is -->> ", selectedcategory);
    if(updatedPaperData.category === selectedcategory){
      //#PROD logger.log("Same category selected");
      return;
    }
    setSelectedCategory(selectedcategory),
    setSelectedSubcategory("");
    setSelectedSubcategoryLevel2("");
    setUpdatedPaperData({
      ...updatedPaperData,
      category: selectedcategory,
      subcategory: "",
      subcategorylvl2: "",
    });
    const subcategoriesForCategory = hardcodedSubcategories[selectedcategory];
    // Update the state for Subcategories
    setSubcategories(Object.keys(subcategoriesForCategory));
  };

  const handleSubcategoryChange = (selectedsubcategory) => {
    //#PROD logger.log("sub category selected is -->> ", selectedsubcategory);
    if(updatedPaperData.subcategory === selectedsubcategory){
      //#PROD logger.log("Same category selected");
      return;
    }
    setSelectedSubcategory(selectedsubcategory);
    setSelectedSubcategoryLevel2("");
    setUpdatedPaperData({
      ...updatedPaperData,
      subcategory: selectedsubcategory,
      subcategorylvl2: "",
    });
    const subcategoriesLevel2ForSubcategory = hardcodedSubcategories[updatedPaperData.category][selectedsubcategory];
    // Update the state for Subcategories Level 2
    setSubcategoriesLevel2(subcategoriesLevel2ForSubcategory);
  };
  const handleSubcategoryLevel2Change = (selectedsubcategorylvl2) => {
    setSelectedSubcategoryLevel2(selectedsubcategorylvl2);
    setUpdatedPaperData({
      ...updatedPaperData,
      subcategorylvl2: selectedsubcategorylvl2,
    });
  };

  // Similar handlers for subcategory and subcategoryLevel2

  const handleDifficultyLevelChange = (level) => {
    setselectedDifficultyLevel(level);
    setUpdatedPaperData({ ...updatedPaperData, difflvl: level });
  };

  const handleAddSection = () => {
    if (sections.length < 5) {
      setSections([...sections, {}]);
    }
  };

  const handleDeleteSection = (indexToDelete) => {
    setSections((prevSections) => {
      return prevSections.filter((section, index) => index !== indexToDelete);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        
    // Validate examPrice to ensure it's a number
        if (isNaN(Number(numQuestions))) {
          setDialogTitle("Validation Error!!");
          setDialogMessage("Number of Questions must be a number.");
          setDialogOpen(true);
//          alert("Number of Questions must be a number.");
          setLoading(false); // Reset loading state
          return;
        }
         // Validate examPrice to ensure it's a number
         if (isNaN(Number(allocatedTime))) {
          setDialogTitle("Validation Error!!");
          setDialogMessage("Alllocated Time must be a number.");
          setDialogOpen(true);
//          alert("Alllocated Time must be a number.");
          setLoading(false); // Reset loading state
          return;
        }
           // Validate examPrice to ensure it's a number
           if (isNaN(Number(examPrice))) {
            setDialogTitle("Validation Error!!");
            setDialogMessage("Exam Price must be a number.");
            setDialogOpen(true);
//            alert("Exam Price must be a number.");
            setLoading(false); // Reset loading state
            return;
          }

    setLoading(true); // Set loading state to true when form is submitted

    // Prepare section data
    const sectionsData = sections.map((section, index) => ({
      name: section.name || `Section ${index + 1}`,
      marks: section.marks || 0,
      negativeMarks: section.negativeMarks || 0, // Include negativeMarks property
    }));
    
    const examData = {
      ...updatedPaperData,
      papertitle: examTitle,
      paperdesc: examDescription,
      qcount: numQuestions,
      examtime: allocatedTime,
      price: examPrice,
      sections: sectionsData, // Include sections data in examData
    };
    logger.log("examData is -->> ", examData);
    try {
      await updateExam(examData);
      //#PROD logger.log("Updated exam data:", response.data);
//      setExamId(response.data.paperid);
      setDialogTitle("Success");
      setDialogMessage("Exam Updated Successfully");
      setDialogOpen(true);
//      alert("Exam data updated successfully");
//      navigate("/submittedpapers");
    } catch (error) {
      console.error("Error updating exam:", error);
      // Handle error
    } finally {
      setLoading(false); // Reset loading state when API call is complete
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogTitle === "Success") {
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
        Edit Exam
      </Typography>
      <Box sx={{ padding: 0 }}>
        <Paper sx={{ padding: 4 }}>
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
            onChange={(e) => handleSubcategoryLevel2Change(e.target.value)}
            disabled={!selectedSubcategory}
          >
            {subcategoriesLevel2.map((subcategoryLevel2) => (
              <MenuItem key={subcategoryLevel2} value={subcategoryLevel2}>
                {subcategoryLevel2}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
              {/* Subcategory and Subcategory Level 2 similar to CreateExam */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={selectedDifficultyLevel}
                    onChange={(e) =>
                      handleDifficultyLevelChange(e.target.value)
                    }
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
          label={`Section ${index + 1} Marks`}
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
          label={`Section ${index + 1} Negative Marks`}
          value={section.negativeMarks || ""}
          onChange={(e) =>
            setSections((prevSections) => {
              const updatedSections = [...prevSections];
              updatedSections[index].negativeMarks = e.target.value;
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
  >
    Add Section
  </Button>
</Grid>
              {/* Exam details similar to CreateExam */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                {loading ? ( // Conditional rendering based on loading state
                    <CircularProgress size={24} color="inherit" /> // Display loading indicator
                  ) : (
                    "Update Exam" // Display button text
                  )}
                </Button>
                <Button variant="contained" color="primary" onClick={handleCancel}>
                {loading ? ( // Conditional rendering based on loading state
                    <CircularProgress size={24} color="inherit" /> // Display loading indicator
                  ) : (
                    "Cancel" // Display button text
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
        onConfirm={handleDialogClose}
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true} // Show only the OK button
      />
    </Container>
  );
};

export default EditExam;
