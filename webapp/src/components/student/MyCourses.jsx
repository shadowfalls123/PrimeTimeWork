import React, { useState, useEffect } from 'react';
import logger from "../../util/logger";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
//import { AddShoppingCart } from "@mui/icons-material";
import { Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getPackCoursesForUser } from "../../services";
import { RingLoadingIcon } from '../common/LoadingIcon';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflowX: "scroll",
    padding: theme.spacing(2),
    "&::-webkit-scrollbar": {
      height: "0.5em",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey[500],
      borderRadius: "1em",
    },
    "&::-webkit-scrollbar-track": {
      borderRadius: "1em",
    },
  },
  card: {
    minWidth: 280,
    maxWidth: 280,
    margin: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    transition: "box-shadow 0.3s",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    height: "100%",
    overflow: "hidden",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
    overflowY: "auto",
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  title: {
    overflowY: "auto", // Enable scrolling for the title if needed
    maxHeight: 80, // Set a maximum height for the title
    textOverflow: "ellipsis",
    WebkitLineClamp: 2, // Limit to 2 lines for title
    WebkitBoxOrient: "vertical",
    transition: "max-height 0.3s ease",
  },
  description: {
    overflowY: "auto", // Enable scrolling for the description if needed
    maxHeight: 150, // Set a maximum height for the description
    textOverflow: "ellipsis",
    // display: "-webkit-box",
    WebkitLineClamp: 4, // Limit to 4 lines initially
    WebkitBoxOrient: "vertical",
    transition: "max-height 0.3s ease",
    marginTop: theme.spacing(1), // Add spacing between description and title
    marginBottom: theme.spacing(1), // Add spacing between description and price
  },
}));

// Check the environment variable to determine the current environment
const isDevelopment = process.env.REACT_APP_ENV === 'development';

const MyCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classes = useStyles();
  const [pack, setPack] = useState();

    // Assigning state value to a variable
//    const selectedPack  = location.state && location.state.pack;
    const selectedPack = location.state?.selectedPack || null;
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

useEffect(() => {
  if (selectedPack) {
    setPack(selectedPack);
  }
}, [selectedPack]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedMyCourses = localStorage.getItem('cachedMyCourses-----');
      if (cachedMyCourses) {
        setPapers(JSON.parse(cachedMyCourses));
      } else {
        await fetchMyPapers();
      }
    };

    fetchData();
  }, []);

  const fetchMyPapers = async () => {
    setIsLoading(true);
    try {
      logger.log("In MyCourses Webapp 1.0 -> selectedPack is -->> ", selectedPack, pack);
      logger.log("selectedPack.paperid -->> ", selectedPack.selectedPapers);
      const paperIDsString = selectedPack.selectedPapers;

      logger.log("In MyCourses Webapp 1.0 -> paperIDsString is -->> ", ""+paperIDsString);
      const response = await getPackCoursesForUser(selectedPack.selectedPapers);
      logger.log("In MyCourses Webapp 1.1 response -->", response);
      const responseData = response.data.enrichedPaperData;

        if (Array.isArray(responseData)) {
          const transformedArray = responseData.map((item) => ({
            pid: item.pid,
            papertitle: item.papertitle,
            paperdesc: item.paperdesc,
            category: item.category,
            subcategory: item.subcategory,
            subcategorylvl2: item.subcategorylvl2,
            difflvl: item.difflvl,
            qcount: parseInt(item.qcount),
            examtime: parseInt(item.examtime),
            price: parseInt(item.price),
            noofreviews: parseInt(item.noofreviews),
            examtaken: parseInt(item.examtaken),
            prating: parseInt(item.rating),
            sections: item.sections.map((section) => ({
              name: section.name,
              negativeMarks: parseInt(section.negativeMarks),
              marks: parseInt(section.marks),
            })),
            firstname: item.firstname,
            lastname: item.lastname,
            guruname: `${item.firstname} ${item.lastname}`,
            avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg', // Example: Replace with dynamic logic if required
          }));
  
        //#PROD logger.log("transformedArray -->> ", transformedArray);
        setPapers(transformedArray);
         
        // Cache papers data
        if (isDevelopment) {
         localStorage.setItem('cachedMyCourses', JSON.stringify(transformedArray));
        }

      } else {
        // Handle no papers available
        setPapers([]);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to fetch Courses');
      setIsSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeExam = (paper) => {
    if (paper.examtaken === 1) {
      // If exam is taken, navigate to reviewexam
//      navigate("/result", { state: { paper } });
      navigate("/reviewans", {
        state: {
          selectedPack,
          paper
        },
      });
    } else {
      // If exam is not taken, navigate to examinstructions
      navigate("/examinstructions", { state: { selectedPack, paper } });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsSnackbarOpen(false);
  };

  const getUserColor = (firstName, lastName) => {
    // Generate a consistent color based on the user's first and last name
    const fullName = firstName.toLowerCase() + lastName.toLowerCase();
    const hash = fullName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const colors = ['#F44336', '#9C27B0', '#2196F3', '#FFEB3B', '#4CAF50', '#FF5722']; // Define a set of colors
    const index = Math.abs(hash % colors.length); // Get the remainder to select a color
    return colors[index];
  };
  
  return (
    <div className={classes.root}>
            <Typography variant="h5" align="center" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
        My Courses
      </Typography>
            <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity="error">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      {isLoading ? (
      <div>
        <RingLoadingIcon />
      </div>
    ) : (
      <>
        {papers.length === 0 ? (
          <Typography variant="h6" component="p">
            Currently, you have not purchased any exams courses. Enhance your learning journey by acquiring our courses and unlock the path to success. 
          </Typography>
        ) : (
      <Grid container>
        {papers.map((paper) => (
          <Grid item key={paper.pid}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <div>
                <div className={classes.title}>
                    <Typography variant="h7" gutterBottom>
                      {paper.papertitle}
                    </Typography>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="subtitle1" component="p" gutterBottom>
                      by {paper.guruname}
                    </Typography>
                <Avatar
                  style={{
                    backgroundColor: getUserColor(paper.firstname, paper.lastname),
                    color: "#fff",
                  }}
                  className={classes.avatar}
                >
                  {paper.firstname.charAt(0)} {paper.lastname.charAt(0)}
                </Avatar>
                  </div>
                  <div className={classes.description}>
                    <Typography
                      variant="body2"
                      component="p"
                      color="textSecondary"
                    >
                      {paper.paperdesc}
                    </Typography>
                  </div>
                </div>
                <div>
                    <Rating
                      name={`rating-${paper.pid}`}
                      value={paper.prating}
                      precision={0.5}
                      readOnly
                    />
                  <Typography variant="body2">
                    {`${paper.prating} (${paper.noofreviews} ${paper.noofreviews === 1 ? 'rating' : 'ratings'})`}
                  </Typography>
                </div>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  className={classes.button}
                  onClick={() => handleTakeExam(paper)}
                >
                  {paper.examtaken === 1 ? "Review Exam" : "Take Exam"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
      </>
    )}
    <br /><br />
    <Button
  variant="contained"
  color="primary"
  onClick={() => navigate(-1)} // Navigate to the previous page
  sx={{ marginBottom: '20px' }} // Add spacing below the button
>
  Back
</Button>

    </div>
  );
};

export default MyCourses;
