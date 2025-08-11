import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import { makeStyles } from "@mui/styles";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
//  Avatar,
  Snackbar,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
//import { AddShoppingCart } from "@mui/icons-material";
import { Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getMyLearningPacks } from "../../services";
import { RingLoadingIcon } from "../common/LoadingIcon";

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
const isDevelopment = process.env.REACT_APP_ENV === "development";

const MyLearnings = () => {
  const navigate = useNavigate();
  const classes = useStyles();

  const [packs, setPacks] = useState([]);
  const [trasformedPacks, setTrasformedPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cachedMyLearnings = localStorage.getItem("cachedMyLearnings ------");
      if (cachedMyLearnings) {
        setTrasformedPacks(JSON.parse(cachedMyLearnings));
      } else {
        await fetchMyPacks();
      }
    };

    fetchData();
  }, []);

  const fetchMyPacks = async () => {
    setIsLoading(true);
    try {
      //#PROD logger.log("In MyLearnings Webapp 1.0 ->");
      const response = await getMyLearningPacks();
      //#PROD logger.log("In MyLearnings Webapp 1.1 response -->", response);
      const responseData = response.data;
      setPacks(responseData);

      logger.log("In MyLearnings Webapp 1.2 responseData -->", responseData);
      if (Array.isArray(responseData)) {
        const transformedArray = responseData.map((item) => ({
          packid: item.packid,
          packdesc: item.packDesc,
          packtitle: item.packTitle,
          prating: parseInt(4),
          avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
          noofreviews: 3,
        }));

        //#PROD logger.log("transformedArray -->> ", transformedArray);
        
        setTrasformedPacks(transformedArray);

        // Cache packs data
        if (isDevelopment) {
          localStorage.setItem(
            "cachedMyLearnings",
            JSON.stringify(transformedArray)
          );
        }
      } else {
        // Handle no packs available
        setTrasformedPacks([]);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch Courses");
      setIsSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    navigate("/searchpack");
  };

  const handleViewSelect = (selectedPack) => {
    logger.log("In MyLearnings Webapp 1.4 selectedPack -->", selectedPack);
    logger.log("In MyLearnings Webapp 1.3 packs -->", packs);
    // Filter packs to get the pack with the same packid
    const filteredPack = packs.filter((pack) => pack.packid === selectedPack.packid);
    logger.log("In MyLearnings Webapp 1.3 filteredPack -->", filteredPack);
    logger.log("In MyLearnings Webapp 1.3 filteredPack[0] -->", filteredPack[0]);
   
    navigate("/mycourses", {
      state: {
        selectedPack: filteredPack[0], // Since filter returns an array, we take the first element
      },
    });

  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setIsSnackbarOpen(false);
  };

  return (
    <div className={classes.root}>
      <Typography
        variant="h5"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold" }}
      >
        My Learnings
      </Typography>
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
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
          {trasformedPacks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <br />
              {/* <Typography variant="h6" component="p"> */}

                <Typography variant="h6" component="p">
                It looks like you haven&apos;t purchased any exam courses yet. Don&apos;t worry, it&apos;s not too late! Our expert-led courses are designed to help you succeed and ace your exams. Get started today and unlock your potential.
                </Typography>
                <br />
                {/* <Typography variant="h6" component="p">
                  Unlock your full potential with our exclusive exam courses! By purchasing our courses, you&apos;ll gain the knowledge and tools necessary to excel in your exams and take a confident step towards success. Ready to take your learning to the next level?
                </Typography> */}
                
              {/* </Typography> */}

              <br />
              <Button variant="contained" color="secondary" onClick={handleSearchClick} sx={{ marginTop: 2 }}>
                Search Packages
              </Button>
            </div>
          ) : (
            <Grid container>
              {trasformedPacks.map((pack) => (
                <Grid item key={pack.packid}>
                  <Card className={classes.card}>
                    <CardContent className={classes.cardContent}>
                    <div>  
                      <div className={classes.title}>
                        <Typography variant="h7" gutterBottom>
                          {pack.packtitle}
                        </Typography>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                        </div>
                        <div className={classes.description}>
                        <Typography
                          variant="body2"
                          component="p"
                          color="textSecondary"
                        >
                          {pack.packdesc}
                        </Typography>
                        </div>
                      </div>
                      <div>
                        <Rating
                          name={`rating-${pack.packid}`}
                          value={pack.prating}
                          precision={0.5}
                          readOnly
                        />
                        <Typography variant="body2">
                          {`${pack.prating} (${pack.noofreviews} ${
                            pack.noofreviews === 1 ? "rating" : "ratings"
                          })`}
                        </Typography>
                      </div>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className={classes.button}
                        onClick={() => handleViewSelect(pack)}
                      >
                        View Pack
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </div>
  );
};

export default MyLearnings;
