import React, { useState, useEffect } from "react";
//import { useDispatch } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
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
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import { AddShoppingCart } from "@mui/icons-material";
//import { Rating } from '@mui/material';
import { addToCart } from "../../../../store";
import { getTopRatedPapers, getMyCoursesForUser } from "../../../../services";
//import { ClipLoadingIcon, BeatLoadingIcon, PulseLoadingIcon, RingLoadingIcon } from './common/LoadingIcon';
import { RingLoadingIcon } from "../../LoadingIcon";
import { useNavigate } from "react-router-dom";

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
  cardWrapper: {
    display: "flex",
    maxHeight: 400,
    maxWidth: 250,
    flexGrow: 1,
    [theme.breakpoints.down("sm")]: {
      maxWidth: "unset",
    },
  },
  card: {
    // maxWidth: 250,
    flexGrow: 1,
    // width: 300,
    [theme.breakpoints.down("sm")]: {
      width: "unset",
    },
    // margin: theme.spacing(1),
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
    flexGrow: 1,
    overflowY: "auto",
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  dialogTitle: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  closeButton: {
    color: theme.palette.common.white,
  },
}));



// Check the environment variable to determine the current environment
const isDevelopment = process.env.REACT_APP_ENV === 'development';

const ExamPapers = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const classes = useStyles();

  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const [userCourses, setUserCourses] = useState([]);
  /*
  useEffect(() => {
    fetchTopRatedPapers();
  }, []);
*/

useEffect(async() => {
    // Try to fetch data from cache
    const cachedPapers = JSON.parse(localStorage.getItem("cachedPapers"));

    if (cachedPapers) {
      setPapers(cachedPapers);
      //#PROD logger.log("CME_Message - Loading data from local cache !! ");
      //#PROD logger.log("CME_Message - datain local cache is -->>  ", cachedPapers);
      updateCartStatus(cachedPapers);
    } else {
      await fetchTopRatedPapers();
      //#PROD logger.log("CME_Message - Loading data from server !! ");
      updateCartStatus(papers);
    }
    
    const cachedMyCourses = localStorage.getItem('cachedMyCourses');
    if (cachedMyCourses) {
      //#PROD logger.log("CME_Message - Loading data from local cache !! ");
      setUserCourses(JSON.parse(cachedMyCourses));
    } else {
      fetchUserCourses();
    }

  }, []);

  const fetchTopRatedPapers = async () => {
    setIsLoading(true);
    try {
      //#PROD logger.log(" In fetchTopRatedPapers Webapp 1.0 -> ");
      const response = await getTopRatedPapers();
      logger.log(" In fetchTopRatedPapers response is -> ", response);
      const data = await response;
      //#PROD logger.log(" In fetchTopRatedPapers data is -> ", data);
      // setPapers(data);
     
      // Check if the received data is valid papers or "No papers are published yet"
//    if (typeof data === 'string' && data === "No papers are published yet") {
      if(data.length === 0 ) {
        logger.log("No papers available yet");
      // Handle the case when no papers are available
      // For instance, setting a default value or showing a message
    } else if (Array.isArray(data) && data.length > 0) {
      // If valid papers are received, set the state with the papers
      //#PROD logger.log("Setting paper data", data);
      setPapers(data);
      // Cache the fetched data to local storage
      if (isDevelopment) {
      localStorage.setItem("cachedPapers", JSON.stringify(data));
      }
    } else {
      console.error("Received unexpected or invalid data from API");
      // Handle the case when the received data is unexpected or invalid
      // For instance, setting a default value or showing an error message
    }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch top-rated papers");
      setIsSnackbarOpen(true);
    }
    setIsLoading(false);
  };

  const fetchUserCourses = async () => {
    try {
      const response = await getMyCoursesForUser();
      logger.log("In fetchUserCourses Webapp 1.0 response ->", response);
      logger.log("In fetchUserCourses Webapp 1.0 response.data.length ->", response.data.enrichedPaperData.length);
      if(response.data.enrichedPaperData.length > 0 ) {
      const data = await response.data.enrichedPaperData;
      logger.log("In fetchUserCourses Webapp 1.0 ->", data);
      setUserCourses(data);
      } else {
        logger.log("No courses available yet");
        setUserCourses([]);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to fetch user courses');
      setIsSnackbarOpen(true);
    }
  };

  const updateCartStatus = (passedPapers) => {
    // Update cart status when papers change
    //#PROD logger.log(" In useEffect updating isInCart status 1.0 -> ");
    //#PROD logger.log(" In useEffect updating isInCart status cartItems is -> ", cartItems);
    //#PROD logger.log(" In useEffect updating isInCart status papers is -> ", passedPapers);
    const updatedPapers = passedPapers.map((paper) => {
      const found = cartItems.find((item) => item.itemId === paper.pid);
      //#PROD logger.log(" In updateCartStatus found is -> ", found);
      return found ? { ...paper, isInCart: true } : { ...paper, isInCart: false };
    });
  
    if(updatedPapers.length > 0){
      setPapers(updatedPapers);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setIsSnackbarOpen(false);
  };

  // const handleAddToCart = (paper) => {
  //   setSelectedPaper(paper);
  //   setIsAddedToCart(true);
  //   const price = paper.price;
  //   //#PROD logger.log(`Added exam paper with id ${paper.pid} to cart`);
  //   dispatch(addToCart({ item: paper, price: parseFloat(price) }));
  //       // After adding to cart, update the cart status
  //       updateCartStatus(cartItems);
  // };

  const handleAddToCart = (paper) => {
    setSelectedPaper(paper);
  
    const price = parseFloat(paper.price);
    const itemId = paper.pid
    const title = paper.papertitle
    const itemCat = "paper";
//    dispatch(addToCart({ item: pkg, price: parseFloat(price) }));
    dispatch(addToCart({ title: title, itemId: itemId, itemCat: itemCat, price: price}));
  
//    dispatch(addToCart({ item: paper, price: parseFloat(price) }));
  
    // Update papers state to mark the paper as in the cart
    const updatedPapers = papers.map((p) => {
      if (p.pid === paper.pid) {
        return { ...p, isInCart: true };
      }
      return p;
    });
    //#PROD logger.log(" In handleAddToCart updatedPapers is -> ", updatedPapers);
    setPapers(updatedPapers); // Update papers state
    //#PROD logger.log(" In handleAddToCart papers is -> ", papers);
  
    setIsAddedToCart(true); // Set isAddedToCart to true for showing the Dialog
  
    // // Update cart status after a short delay (optional, for consistency)
    // setTimeout(() => {
    //   updateCartStatus();
    // }, 100);
  };

  
  const handleGoToCart = () => {
    // Navigate to the cart page or perform actions related to cart
    setIsAddedToCart(false);
    navigate("/cart");
    // handle navigation to cart
  };

  const handleClose = () => {
    setIsAddedToCart(false);
    // Perform actions when the Dialog is closed
  };
  // Handler function for clicking the paper title link
  const handleTitleClick = (paper) => {
    //  dispatch(selectExam(paperId)); // Assuming you have a selectExam action from Redux
    //#PROD logger.log(" In handleTitleClick pid is -> ", paper);
    navigate("/examdtls", { state: { paper } });
    //navigate(`/examdtls/${pid}`);
  };

  // const getRandomColor = () => {
  //   // Function to generate a random color in hexadecimal format
  //   return "#" + Math.floor(Math.random() * 16777215).toString(16);
  // };

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
      {/* {isLoading && <div> <ClipLoadingIcon /> <BeatLoadingIcon/> <PulseLoadingIcon/> <RingLoadingIcon/></div>} */}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="error">
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {isLoading && (
        <div>
          {" "}
          <RingLoadingIcon />
        </div>
      )}
      <Grid container sx={{ gap: 2 }}>
        {papers.length > 0 ? (
          papers.map((paper) => (
            <Grid item key={paper.pid} className={classes.cardWrapper}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <div>
                    <Typography
                      variant="h6"
                      onClick={() => handleTitleClick(paper)}
                      gutterBottom
                      style={{
                        textDecoration: "underline", // Underline to simulate a link
                        color: "blue", // Blue color for link appearance
                        cursor: "pointer", // Change cursor to indicate clickable element
                      }}
                    >
                      {paper.papertitle}
                    </Typography>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        component="p"
                        gutterBottom
                      >
                        by {paper.firstname} {paper.lastname}
                      </Typography>
                      {/* <Avatar
                        src={paper.avatarUrl}
                        alt={paper.guruname}
                        className={classes.avatar}
                      /> */}
                      {/* Avatar with random image */}
  {/* Avatar with random placeholder */}
                <Avatar
                  style={{
//                    backgroundColor: getRandomColor(),
                    backgroundColor: getUserColor(paper.firstname, paper.lastname),
                    color: "#fff",
                  }}
                  className={classes.avatar}
                >
                  {paper.firstname.charAt(0)} {paper.lastname.charAt(0)}
                </Avatar>
                    </div>
                    <Typography
                      variant="body1"
                      component="p"
                      color="textSecondary"
                    >
                      {paper.paperdesc}
                    </Typography>
                  </div>
                  {/* <div>
                    <Typography variant="body2">{paper.guruname}</Typography>
                    <Avatar
                      alt={paper.guruname}
                      src={paper.avatarUrl}
                      className={classes.avatar}
                    />
                  </div> */}
                  <div>
                    <br></br>
                    <Typography variant="body2" 
                    onClick={() => handleTitleClick(paper)}
                    style={{
                      textDecoration: "underline", // Underline to simulate a link
                      color: "blue", // Blue color for link appearance
                      cursor: "pointer", // Change cursor to indicate clickable element
                    }}
                    >
                      <Rating
                        name={`rating-${paper.pid}`}
                        value={paper.rating}
                        precision={0.1}
                        readOnly
                      />
                    </Typography>
                    <Typography variant="body2">
                    {`${paper.rating} (${paper.noofreviews} ${paper.noofreviews === 1 ? 'rating' : 'ratings'})`}
                  </Typography>

                    <Typography variant="h6" style={{marginTop:"10px"}}>{`₹ ${paper.price}`}</Typography>
                  </div>
                </CardContent>
                <CardActions>
                {(userCourses.some((course) => course.pid === paper.pid)) ? (
                    <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    // onClick={() => handleGoToCart()}
                    className={classes.button}
                    disabled={true} // Disable the button if the course is already purchased
                  >
                    Course Already Purchased
                  </Button>
                ) : paper.isInCart ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleGoToCart()}
                    className={classes.button}
                  >
                    Go to cart
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddShoppingCart />}
                    onClick={() => handleAddToCart(paper)}
                    className={classes.button}
                  >
                    Add to cart
                  </Button>
                )}
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          // Render a message if there are no matching papers
          <Grid item xs={12}>
            <Typography variant="body1">Papers not available.</Typography>
          </Grid>
        )}
        {/* Dialog for "Added to Cart" window */}
        <Dialog open={isAddedToCart} onClose={handleClose}>
          <DialogTitle className={classes.dialogTitle}>
            <Typography variant="h7">Added to Cart</Typography>
            <IconButton className={classes.closeButton} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <Typography variant="h7">
              {selectedPaper && selectedPaper.papertitle}
            </Typography>
            {/* Include other details related to the added paper */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleGoToCart} color="primary">
              Go to Cart
            </Button>
            <Button onClick={handleClose} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </div>
  );
};

export default ExamPapers;
