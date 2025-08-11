import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { addMyCourses } from "../../services";
import { emptyCart } from "../../store";

import { styled } from "@mui/material/styles";

const StyledForm = styled("form")({
  width: "100%",
  maxWidth: "400px",
  margin: "0 auto",
  textAlign: "center",
});

const StyledCardElement = styled(CardElement)({
  border: "1px solid #ccc",
  padding: "10px",
  borderRadius: "4px",
});

const PaymentForm = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();

  const handleRemoveAllItemsFromCart = () => {
    dispatch(emptyCart());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    //#PROD logger.log(" Payment form 1.0 ");

    if (!stripe || !elements) {
      return;
    }
    //#PROD logger.log(" Payment form 2.0 ");

    //Uncomment for actual payment process using stripe
    // const { paymentMethod, error } = await stripe.createPaymentMethod({
    //   type: 'card',
    //   card: elements.getElement(CardElement),
    // });

    const error = ""; //Delete these when implementing actual payment method

    //#PROD logger.log(" Payment form 3.0 ");
    if (error) {
      //#PROD logger.log(" Payment form 3.1 ");

      //#PROD logger.log(error);
    } else {
      //Uncomment for actual payment process using stripe
      // const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: paymentMethod.id,
      // });
      const paymentIntentstatus = "succeeded"; //Delete these when implementing actual payment method

      //#PROD logger.log(" Payment form 4.0 ");
      //      if (paymentIntent.status === 'succeeded') {
      if (paymentIntentstatus === "succeeded") {
        //Delete these when implementing actual payment method and use paymentIntent.status
        // Make API call to save paper details for the user
        try {
          //#PROD logger.log("Calling addMyCourses for saving course purchase data ");
          const response = await addMyCourses(cartItems);
          //#PROD logger.log("response is -->> ", response);
          handleRemoveAllItemsFromCart();
        } catch (err) {
          //#PROD logger.log("Error saving course purchase data ");
        }

        // const response = await fetch('/api/save-paper-details', {
        //   method: 'POST',
        //   body: JSON.stringify({ paymentIntent }),
        //   headers: {
        //     'Content-Type': 'application/json'
        //   }
        // });
        //#PROD logger.log(" Payment form 5.0 ");
        //        const data = await response.json();
        //#PROD logger.log(" Payment form 6.0 ");
        //        //#PROD logger.log(data);
      }
    }
  };

  return (
    // <form onSubmit={handleSubmit}>
    //   <label>
    //     Card details
    //     <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
    //   </label>
    //   <button type="submit" disabled={!stripe}>
    //     Pay now
    //   </button>
    // </form>

    <StyledForm onSubmit={handleSubmit}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12}>
          <Typography variant="h6" align="left" sx={{ fontWeight: 'bold' }}>
            Pay using Credit or Debit card
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="card-owner-name"
            label="Cardholder Name"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              notched: false,
              style: { fontSize: "16px" },
              readOnly: false, // Stripe's CardElement will be injected here
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <StyledCardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  "::placeholder": { color: "#aab7c4" },
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!stripe}
            fullWidth
          >
            Pay now
          </Button>
        </Grid>
      </Grid>
    </StyledForm>
  );
};

export default PaymentForm;
