import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Grid,
} from "@mui/material";
//import PaymentForm from "./PaymentForm";
//import { Elements } from "@stripe/react-stripe-js";
//import { loadStripe } from "@stripe/stripe-js";
import { getMyCredits } from "../../services";
import { addMyCourses } from "../../services";
import { emptyCart } from "../../store";
import { RingLoadingIcon } from "../common/LoadingIcon";
import ConfirmationDialog from "../common/ConfirmationDialog";
//const stripePromise = loadStripe("your_publishable_key");

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);
  const [myCredits, setMyCredits] = React.useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const handlepaymentSuccess = () => {
    setIsPaymentSuccess(true);
    setOpenDialog(true);
    setDialogTitle("Payment Success");
    setDialogMessage("Payment is Successful - Happy Learning");
//    navigate("/mycourses");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    if (isPaymentSuccess) {
      handleRemoveAllItemsFromCart();
      setIsPaymentSuccess(false);
      navigate("/mylearnings");
    }
  };
  const handleRemoveAllItemsFromCart = () => {
    dispatch(emptyCart());
  };

  const payUsingWallet = async() => {
    try {
      //#PROD console.log("Calling addMyCourses for saving course purchase data ");
      console.log("cartItems -->> ", cartItems);
      const response = await addMyCourses(cartItems);
      //#PROD console.log("response is -->> ", response);
      if (response.status === 200 && response.data === "Data uploaded successfully") {
//        alert("Payment is Successful - Happy Learning");
        handleRemoveAllItemsFromCart();
        handlepaymentSuccess();  
      } else if (response.status === 200 && response.data === "Wallet balance is not sufficient.") {
        setOpenDialog(true);
        setDialogTitle("Payment Error");
        setDialogMessage("Wallet balance is not sufficient.");
        //alert("Wallet balance is not sufficient.");
//        handleRemoveAllItemsFromCart();
//        handlepaymentSuccess();  
      }
    
    } catch (err) {
      //#PROD console.log("Error saving course purchase data ");
    }

  }

  useEffect(() => {
    // if (myCredits > 5000) {
      getMyWalletCredits();
    // }
  }, []);

  const getMyWalletCredits = async () => {
        setIsLoading(true);
    try {
      //#PROD console.log("In getMyWalletCredits Webapp 1.0 ->");
      const response = await getMyCredits();
      //#PROD console.log("In getMyWalletCredits Webapp 1.1 response -->", response);
      const responseData = response.data;
      setMyCredits(responseData);
      //#PROD console.log("In getMyWalletCredits Webapp 1.2 responseData -->", responseData);
      //#PROD console.log("In getMyWalletCredits Webapp 1.2 myCredits -->", myCredits);
    } catch (err) {
      console.error("Failed to fetch Wallet Credits", err);
      setOpenDialog(true);
      setDialogTitle("Error");
      setDialogMessage("Failed to fetch Wallet Credits");
    } finally {
            setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Checkout
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Title</TableCell>
              <TableCell align="right">Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartItems.map((item) => (
              <TableRow key={item.itemId}>
                <TableCell>{item.title}</TableCell>
                <TableCell align="right">
                ₹{parseFloat(item.price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Total Price</TableCell>
              <TableCell align="right">₹{totalPrice.toFixed(2)}</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      {isLoading ? (
          <RingLoadingIcon />
        ) : (          
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={6}>
          <Typography
            variant="h6"
            align="left"
            sx={{ marginTop: "20px", marginBottom: "20px", fontWeight: "bold" }}
          >
            My ExamsAreFun Wallet Balance is  ₹ {myCredits}
          </Typography>
        </Grid>
        <Grid item xs={6} container justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={payUsingWallet} disabled={myCredits < totalPrice}>
            Pay Using ExamsAreFun Wallet Balance
          </Button>
          {/* Display message if credits are insufficient */}
          {myCredits < totalPrice && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              You do not have sufficient balance. Please get in touch with ExamsAreFun team to get the credits added to your account.
            </Typography>
          )}
        </Grid>
      </Grid>
        )}

{/* uncomment this code to display Credit Card and Debit card payment option */}
      {/* <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ marginTop: 2 }}>
        <Elements stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      </Grid> */}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogClose} // Close the dialog when OK button is clicked
        title={dialogTitle}
        message={dialogMessage}
        showOnlyOkButton={true}
      />

    </Box>
  );
};

export default Checkout;
