import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
} from "@mui/material";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { emptyCart } from "../../store";
import { getMyCredits } from "../../services";
import { processWalletPayment } from "./PaymentProviders/walletService";
import { processRazorpayPayment } from "./PaymentProviders/razorpayService";
import { processPhonePePayment } from "./PaymentProviders/phonepeService";
//import { processStripePayment } from "./PaymentProviders/stripeService";
// import { Elements, loadStripe, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Load Stripe with your public key
// const stripePromise = loadStripe("YOUR_STRIPE_PUBLIC_KEY");

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.items);
    const totalPrice = useSelector((state) => state.cart.totalPrice);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("");
    const [dialogMessage, setDialogMessage] = useState("");
    const [myCredits, setMyCredits] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("wallet");
    const [redirectAfterDialog, setRedirectAfterDialog] = useState(false);

    useEffect(() => {
        const fetchWalletCredits = async () => {
            try {
                const response = await getMyCredits();
                setMyCredits(response.data);
            } catch (error) {
                console.error("Error fetching wallet credits: ", error);
            }
        };

        fetchWalletCredits();
    }, []);

        // Function to handle dialog close
    const handleDialogClose = () => {
        setOpenDialog(false);
        if (redirectAfterDialog) {
            navigate("/mylearnings"); // Navigate only after dialog is closed
        }
    };

    const handlePayment = async () => {
      switch (paymentMethod) {
          case "wallet": {
              const walletResponse = await processWalletPayment(cartItems, totalPrice, myCredits);
              setDialogTitle(walletResponse.success ? "Payment Successful" : "Payment Failed");
              setDialogMessage(walletResponse.message);
              setOpenDialog(true);
              if (walletResponse.success) { 
                dispatch(emptyCart());
                setRedirectAfterDialog(true);
            }
              break;
          }
  
          case "razorpay": {
              processRazorpayPayment(
                cartItems, totalPrice,
                  () => {
                      setDialogTitle("Payment Successful");
                      setDialogMessage("Payment completed successfully. Happy Learning !!");
                      setOpenDialog(true);
                      dispatch(emptyCart());
                      setRedirectAfterDialog(true);
                    //   navigate("/mylearnings");
                  },
                  (errorMessage) => {
                      setDialogTitle("Payment Failed");
                      setDialogMessage(errorMessage);
                      setOpenDialog(true);
                  }
              );
              break;
          }

          case "phonepe": {
            processPhonePePayment(
                cartItems, totalPrice,
                () => {
                    setDialogTitle("Payment Successful");
                    setDialogMessage("PhonePe payment completed successfully.");
                    setOpenDialog(true);
                    dispatch(emptyCart());
                    setRedirectAfterDialog(true);
                },
                (errorMessage) => {
                    setDialogTitle("Payment Failed");
                    setDialogMessage(errorMessage);
                    setOpenDialog(true);
                }
            );
            break;
        }
        
  
          // case "stripe": {
          //     const elements = useElements(); // Ensure `elements` is used here
          //     processStripePayment(
          //         elements,
          //         CardElement,
          //         totalPrice,
          //         () => {
          //             setDialogTitle("Payment Successful");
          //             setDialogMessage("Stripe payment completed successfully.");
          //             setOpenDialog(true);
          //             dispatch(emptyCart());
          //         },
          //         (errorMessage) => {
          //             setDialogTitle("Payment Failed");
          //             setDialogMessage(errorMessage);
          //             setOpenDialog(true);
          //         }
          //     );
          //     break;
          // }
  
          default: {
              setDialogTitle("Payment Method Not Supported");
              setDialogMessage("Please select a valid payment method.");
              setOpenDialog(true);
          }
      }
  };
  

    return (
        // <Elements stripe={stripePromise}>
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
                                    <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
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
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select Payment Method</FormLabel>
                            <RadioGroup
                                row
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <FormControlLabel value="wallet" control={<Radio />} label="Wallet" />
                                <FormControlLabel value="razorpay" control={<Radio />} label="Razorpay" />
                                <FormControlLabel value="phonepe" control={<Radio />} label="PhonePe" />
                                {/* <FormControlLabel value="stripe" control={<Radio />} label="Stripe" /> */}
                            </RadioGroup>
                        </FormControl>
                                <Grid item xs={6}>
                                  <Typography
                                    variant="h6"
                                    align="left"
                                    sx={{ marginTop: "20px", marginBottom: "20px", fontWeight: "bold" }}
                                  >
                                    Wallet Balance is  ₹ {myCredits}
                                  </Typography>
                                </Grid>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                        {/* <CardElement /> */}
                        <Button variant="contained" color="primary" onClick={handlePayment}>
                            Pay Now
                        </Button>
                    </Grid>
                </Grid>
                <ConfirmationDialog
                    open={openDialog}
                    // onClose={() => setOpenDialog(false)}
                    onClose={handleDialogClose}
                    title={dialogTitle}
                    onConfirm={() => {}}
                    message={dialogMessage}
                    showOnlyOkButton={true}
                />
            </Box>
        // </Elements>
    );
};

export default Checkout;
