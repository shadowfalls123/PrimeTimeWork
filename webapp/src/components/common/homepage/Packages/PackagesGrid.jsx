import React from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
} from "@mui/material";
import { Close as CloseIcon, AddShoppingCart } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { RingLoadingIcon } from "../../LoadingIcon";
import MuiAlert from "@mui/material/Alert";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  cardWrapper: {
    maxWidth: 280,
    minWidth: 280,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: 350, // Ensure uniform height
  },
  cardContent: {
    flexGrow: 1,
    overflow: "hidden", // Prevent overflow of long content
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
  // descriptionExpanded: {
  //   overflowY: "auto", // Enable scrolling for expanded content
  //   maxHeight: 300, // Set a maximum height for scrolling
  // },
  // showMoreButton: {
  //   marginTop: theme.spacing(1),
  // },
  cardActions: {
    marginTop: "auto", // Push actions to the bottom of the card
  },
}));

const PackagesGrid = ({
  packages,
  isLoading,
  isAddedToCart,
  handleAddToCart,
  handleGoToCart,
  handleClose,
  selectedPackage,
  snackbarMessage,
  isSnackbarOpen,
  handleSnackbarClose,
  userCourses,
  handleTitleClick,
}) => {
  const classes = useStyles();
  // const [expandedDescription, setExpandedDescription] = useState({});

  // const toggleDescription = (id) => {
  //   setExpandedDescription((prevState) => ({
  //     ...prevState,
  //     [id]: !prevState[id],
  //   }));
  // };

  return (
    <div className={classes.root}>
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
        <Grid container spacing={2}>
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <Grid item key={pkg.packid} className={classes.cardWrapper}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                  <div className={classes.title}>
                    <Typography
                      variant="h7"
                      onClick={() => handleTitleClick(pkg)}
                      gutterBottom
                      style={{
                        textDecoration: "underline",
                        color: "blue",
                        cursor: "pointer",
                      }}
                    >
                      {pkg.packTitle}
                    </Typography>
                    </div>
                    <div className={classes.description}>
                      <Typography
                        variant="body2"
                        component="p"
                        color="textSecondary"
                      >
                        {pkg.packDesc}
                      </Typography>
                    </div>
                    {/* {pkg.packDesc.length > 100 && (
                      <Button
                        size="small"
                        className={classes.showMoreButton}
                        onClick={() => toggleDescription(pkg.packid)}
                      >
                        {expandedDescription[pkg.packid]
                          ? "Show Less"
                          : "Show More"}
                      </Button>
                    )} */}
                    <Typography variant="h7" style={{ marginTop: "10px" }}>
                      {`₹ ${pkg.packPrice}`}
                    </Typography>
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    {userCourses.some((course) => course.packid === pkg.packid) ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        className={classes.button}
                        disabled
                      >
                        Pack Already Purchased
                      </Button>
                    ) : pkg.isInCart ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleGoToCart}
                        className={classes.button}
                      >
                        Go to Cart
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddShoppingCart />}
                        onClick={() => handleAddToCart(pkg)}
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
            <Grid item xs={12}>
              <Typography variant="body1">Packages not available.</Typography>
            </Grid>
          )}

          <Dialog open={isAddedToCart} onClose={handleClose}>
            <DialogTitle className={classes.dialogTitle}>
              <Typography variant="h7">Added to Cart</Typography>
              <IconButton className={classes.closeButton} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h7">
                {selectedPackage && selectedPackage.packTitle}
              </Typography>
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
      )}
    </div>
  );
};

PackagesGrid.propTypes = {
  packages: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isAddedToCart: PropTypes.bool.isRequired,
  handleAddToCart: PropTypes.func.isRequired,
  handleGoToCart: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedPackage: PropTypes.object,
  snackbarMessage: PropTypes.string.isRequired,
  isSnackbarOpen: PropTypes.bool.isRequired,
  handleSnackbarClose: PropTypes.func.isRequired,
  userCourses: PropTypes.array.isRequired,
  handleTitleClick: PropTypes.func.isRequired,
};

export default PackagesGrid;
