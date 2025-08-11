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
    maxWidth: 345,
  },
  card: {
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogContent: {
    textAlign: "center",
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
        <Grid container sx={{ gap: 2 }}>
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <Grid item key={pkg.packid} className={classes.cardWrapper}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <div>
                      <Typography
                        variant="h6"
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
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="subtitle1" component="p" gutterBottom>
                          {/* by {pkg.firstname} {pkg.lastname} */}
                        </Typography>
                      </div>
                      <Typography variant="body1" component="p" color="textSecondary">
                        {pkg.packDesc}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="h6" style={{ marginTop: "10px" }}>
                        {`₹ ${pkg.packPrice}`}
                      </Typography>
                    </div>
                  </CardContent>
                  <CardActions>
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
                        Go to cart
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
            <DialogContent className={classes.dialogContent}>
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
