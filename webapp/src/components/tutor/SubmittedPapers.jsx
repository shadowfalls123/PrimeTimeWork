import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
  Rating,
} from "@mui/material";
import {
  //  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { getSubmittedPapers } from "../../services";
//import { getSubmittedPapers, deletePaper } from "../../services";
import { useNavigate } from "react-router-dom";
import keyword_extractor from "keyword-extractor";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

// Check the environment variable to determine the current environment
const isDevelopment = process.env.REACT_APP_ENV === "development";

const SubmittedPapersTable = () => {
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedSubcategorylvl2, setSelectedSubcategorylvl2] = useState("All");
  const [categoryOptions, setCategoryOptions] = useState([]); // Initial category options
  const [subcategoryOptions, setSubcategoryOptions] = useState([]); // Initial subCategory options
  const [subcategorylvl2Options, setSubcategorylvl2Options] = useState([]); // Initial subCategory options

  const [categoryOptionsUI, setCategoryOptionsUI] = useState([]); // Initial category options
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandFilter, setExpandFilter] = useState(false); // State to manage expanding filter options
  const [filteredPapers, setFilteredPapers] = useState([]); // State for filtered papers

  const extractCategories = (parsedPapers) => {
    const categories = new Set();
    const subcategories = new Set();
    const subcategorieslvl2 = new Set();

    parsedPapers.forEach((paper) => {
      categories.add(paper.category.trim());
      subcategories.add(paper.subcategory.trim());
      subcategorieslvl2.add(paper.subcategorylvl2.trim());
    });

    return {
      categories: Array.from(categories),
      subcategories: Array.from(subcategories),
      subcategorieslvl2: Array.from(subcategorieslvl2),
    };
  };

  const populateFilters = (parsedPapers) => {
    const extractedCategories = extractCategories(parsedPapers);
    setCategoryOptions(extractedCategories.categories);
    setSubcategoryOptions([]);
    setSubcategorylvl2Options([]);

    // Extract keywords from the paper descriptions
    const keywords = parsedPapers.flatMap((paper) => {
      return keyword_extractor.extract(paper.papertitle, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      });
    });

    // Get unique keywords
    const uniqueKeywords = Array.from(new Set(keywords));

    // Set the uniqueKeywords state
    setCategoryOptionsUI((prevOptions) => [...prevOptions, ...uniqueKeywords]);

    //#PROD logger.log("categoryOptionsUI 1 -->> ", categoryOptionsUI);
    //#PROD logger.log("uniqueKeywords -->> ", uniqueKeywords);
  };

  //useEffect without encryption logic
  useEffect(() => {
    const cachedPapers = localStorage.getItem("submittedPapers");

    if (cachedPapers) {
      const parsedPapers = JSON.parse(cachedPapers);
      setPapers(parsedPapers);

      populateFilters(parsedPapers);
      //#PROD logger.log("CME_Message - Loading data from cache !! ");
    } else {
      fetchPapers();
    }
  }, []);

  //fetchPapers without encryption logic
  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const response = await getSubmittedPapers();
      const data = await response.data;
      logger.log("fetchPapers - data is -->> ", data);
      if (data && data.length > 0) {
        setPapers(data);
        populateFilters(data);

        if (isDevelopment) {
          localStorage.setItem("submittedPapers", JSON.stringify(data));
        }
      } else {
        console.warn("Received empty data. Not saving to local storage.");
      }
    } catch (err) {
      console.error(err);
      // Handle error
    }
    setIsLoading(false);
  };

  const handleEditClick = (paper) => {
    // Handle edit functionality
    logger.log("In handleEditClick Submitted Papers", paper);
    navigate("/editexam", { state: { paper } });
  };

  /*  
  const handleDeleteClick = async (paper) => {
    // Handle delete functionality
    //#PROD logger.log(paper);
    if(paper){
      if (
        confirm(
          "Are you sure you want to delete this paper ? This action cannot be undone."
        )
      ) {
        try {
          //#PROD logger.log("Deleting the paper .............");
          await deletePaper(paper);
          //#PROD logger.log("response -> ", response);
          alert("Paper deleted successfully");
          navigate("/submittedpapers");
        } catch (err) {
          // Error handling
          //setErrors([err]);
          //logger.log("Error in Delete Paper -> ", err);
        }
      }
    }
  };
*/
  const handleAddQuestionClick = async (paper) => {
    navigate("/addquestions", { state: { paper } });
  };

  const handleReviewQuestionClick = async (paper) => {
    navigate("/reviewquestions", { state: { paper } });
  };

  const handleUploadClick = async (paper) => {
    navigate("/uploadFile", { state: { paper } });
  };

  const handleExpandDescription = (index) => {
    setExpandedDesc({ ...expandedDesc, [index]: !expandedDesc[index] });
  };

  // Initialize filteredPapers state to papers when the component mounts
  useEffect(() => {
    setFilteredPapers(papers);
  }, [papers]);

  const handleCategoryChangeUI = (event) => {
    const category = event.target.value.toLowerCase(); // Convert selected category to lowercase
    const isChecked = event.target.checked;

    let updatedCategories;
    if (isChecked) {
      updatedCategories = [...selectedCategories, category];
    } else {
      updatedCategories = selectedCategories.filter((cat) => cat !== category);
    }

    setSelectedCategories(updatedCategories);

    // Filter papers based on selected categories or display all papers if no category selected
    let updatedFilteredPapers;
    if (updatedCategories.length === 0) {
      updatedFilteredPapers = papers;
    } else {
      updatedFilteredPapers = papers.filter((paper) => {
        // Replace this logic with how you determine the presence of a category in the paper
        // For instance, if examdesc contains categories separated by commas
        const paperCategories = paper.papertitle
          .toLowerCase()
          .split(" ")
          .map((cat) => cat.replace(/[^\w\s]/g, "").trim()); // Remove punctuations
        return updatedCategories.some((selCat) =>
          paperCategories.includes(selCat)
        );
      });
    }

    setFilteredPapers(updatedFilteredPapers);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All"); // Set subcategory to "All" by default
    setSelectedSubcategorylvl2("All"); // Reset subcategory level 2 to "All"

    const filteredSubcategories = papers
      .filter((paper) => paper.category === category)
      .map((paper) => paper.subcategory);

    setSubcategoryOptions([...new Set(filteredSubcategories)]);
    setSubcategorylvl2Options([]);
    filterPapers(category, "", "");
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedSubcategorylvl2("All");

    const filteredSubcategorieslvl2 = papers
      .filter(
        (paper) =>
          paper.category === selectedCategory &&
          paper.subcategory === subcategory
      )
      .map((paper) => paper.subcategorylvl2);

    setSubcategorylvl2Options([...new Set(filteredSubcategorieslvl2)]);
    filterPapers(selectedCategory, subcategory, "");
  };

  const handleSubcategorylvl2Change = (subcategorylvl2) => {
    setSelectedSubcategorylvl2(subcategorylvl2);
    filterPapers(selectedCategory, selectedSubcategory, subcategorylvl2);
  };

  const filterPapers = (category, subcategory, subcategorylvl2) => {
    let updatedFilteredPapers = papers;

    if (category && category !== "All") {
      updatedFilteredPapers = updatedFilteredPapers.filter(
        (paper) => paper.category === category
      );
    }

    if (subcategory && subcategory !== "All") {
      updatedFilteredPapers = updatedFilteredPapers.filter(
        (paper) => paper.subcategory === subcategory
      );
    }

    if (subcategorylvl2 && subcategorylvl2 !== "All") {
      updatedFilteredPapers = updatedFilteredPapers.filter(
        (paper) => paper.subcategorylvl2 === subcategorylvl2
      );
    }

    setFilteredPapers(updatedFilteredPapers);
  };

  const handleExpandFilter = () => {
    setExpandFilter(!expandFilter);
  };
  return (
    <Container sx={{ maxWidth: "100vw", margin: "1 auto" }} maxWidth={false}>
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        My Examination Papers
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : papers.length === 0 ? (
        <Typography variant="h6" align="center">
          No papers found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={2}>
            {/* Category filter sidebar */}
            <Typography variant="h6" gutterBottom>
              Apply Filters
            </Typography>
            <FormGroup>
              <label>Category:</label>
              <Autocomplete
                value={selectedCategory}
                options={["All", ...categoryOptions]}
                onChange={(_, newValue) => handleCategoryChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} variant="outlined" fullWidth />
                )}
              />

              {selectedCategory && selectedCategory !== "All" && (
                <>
                  <label>Subcategory:</label>
                  <Autocomplete
                    value={selectedSubcategory}
                    options={["All", ...subcategoryOptions]}
                    onChange={(_, newValue) =>
                      handleSubcategoryChange(newValue)
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" fullWidth />
                    )}
                  />
                </>
              )}

              {selectedSubcategory && selectedSubcategory !== "All" && (
                <>
                  <label>Subcategory Level 2:</label>
                  <Autocomplete
                    value={selectedSubcategorylvl2}
                    options={["All", ...subcategorylvl2Options]}
                    onChange={(_, newValue) =>
                      handleSubcategorylvl2Change(newValue)
                    }
                    renderInput={(params) => (
                      <TextField {...params} variant="outlined" fullWidth />
                    )}
                  />
                </>
              )}

              {categoryOptions.length > 1 && (
                <FormControlLabel
                  control={<Checkbox onChange={handleExpandFilter} />}
                  label="View all"
                />
              )}
              <br />
            </FormGroup>

            <Typography variant="h6" gutterBottom>
              Filter on key words
            </Typography>

            <FormGroup>
              {categoryOptionsUI
                .slice(0, expandFilter ? categoryOptionsUI.length : 2)
                .map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onChange={handleCategoryChangeUI}
                        value={category}
                      />
                    }
                    label={category}
                  />
                ))}
              {categoryOptionsUI.length > 1 && (
                <FormControlLabel
                  control={<Checkbox onChange={handleExpandFilter} />}
                  label="View all"
                />
              )}
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={10}>
            <Grid container spacing={3}>
              {filteredPapers.map((paper, index) => (
                <Grid
                  item
                  xs={12}
                  key={`${paper.userid}-${paper.pid}-${index}`}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{paper.papertitle}</Typography>
                      <Typography variant="body2">
                        <Rating
                          name={`rating-${paper.pid}`}
                          value={paper.rating}
                          precision={0.1}
                          readOnly
                        />
                      </Typography>
                      <Typography variant="body1">
                        <b>Description:</b>{" "}
                        {paper.paperdesc.length <= 200 ? (
                          paper.paperdesc
                        ) : (
                          <>
                            {expandedDesc[index]
                              ? paper.paperdesc
                              : `${paper.paperdesc.substring(0, 200)}... `}
                            <Button
                              onClick={() => handleExpandDescription(index)}
                            >
                              {expandedDesc[index] ? "Read Less" : "Read More"}
                            </Button>
                          </>
                        )}
                      </Typography>

                      {/* <Typography variant="body1">Description: {paper.paperdesc}</Typography> */}
                      <Typography variant="body2">
                        <b>Total Questions:</b> {paper.qcount}
                      </Typography>
                      <Typography variant="body2">
                        <b>Category:</b> `{paper.category} ----&gt;{" "}
                        {paper.subcategory} ----&gt; {paper.subcategorylvl2} `
                      </Typography>
                      <Typography variant="body2">
                        <b>Difficulty Level:</b> ₹{paper.difflvl}
                      </Typography>
                      <Typography variant="body2">
                        <b>Time:</b> {paper.examtime} mins
                      </Typography>
                      <Typography variant="body2">
                        <b>Price:</b> ₹{paper.price}
                      </Typography>
                      {paper.sections && paper.sections.length > 0 && (
                        <Typography variant="body2">
                          <b>Exam Sections:</b>

                          {paper.sections.map((section, idx) => (
                            <li key={idx}>
                              {section.name} --- Marks: {section.marks} --- Negative Marks: {section.negativeMarks}
                            </li>
                          ))}
                        </Typography>
                      )}
                      <div style={{ marginTop: "10px", textAlign: "left" }}>
                        <Tooltip title="Edit" arrow>
                          <IconButton
                            onClick={() => handleEditClick(paper)}
                            aria-label="edit"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {/* <Tooltip title="Delete" arrow>
                          <IconButton
                            onClick={() => handleDeleteClick(paper)}
                            aria-label="delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip> */}
                        <Tooltip title="Upload" arrow>
                          <IconButton
                            onClick={() => handleUploadClick(paper)}
                            aria-label="upload"
                          >
                            <CloudUploadIcon />
                          </IconButton>
                        </Tooltip>
                        <Button
                          onClick={() => handleAddQuestionClick(paper)}
                          aria-label="addquestion"
                        >
                          Add Questions
                        </Button>
                        <Button
                          onClick={() => handleReviewQuestionClick(paper)}
                          aria-label="reviewquestion"
                        >
                          Review Questions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default SubmittedPapersTable;
