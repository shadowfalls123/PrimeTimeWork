import React from "react";
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
  IconButton,
  Box,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { removeFromCart } from "../../store";
import { useNavigate } from "react-router-dom";

const ShoppingCartCME = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);

  const dispatch = useDispatch();

  // //#PROD logger.log("Cart Items -> ", cartItems);

  const handleRemoveFromCart = (item, price) => {
    dispatch(removeFromCart({ item, price }));
  };

  const handleCheckout = () => {
    // Navigate to the checkout page
    navigate("/checkout");
  };

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Typography variant="subtitle1" align="center">
          Your cart is empty
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exam Title</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell align="right">₹{item.price ? parseFloat(item.price).toFixed(2) : "N/A"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleRemoveFromCart(item, parseFloat(item.price))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end",         alignItems: "center", mt: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          Total Price: ₹{totalPrice.toFixed(2)}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCheckout}>
          Checkout
        </Button>
      </Box>
    </>
  )}
</Box>
);
};

export default ShoppingCartCME;
