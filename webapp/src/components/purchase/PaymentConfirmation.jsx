import React from "react";
import { useSelector } from "react-redux";
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
} from "@mui/material";

const PaymentConfirmation = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const totalPrice = useSelector((state) => state.cart.totalPrice);

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Order Confirmation
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
              <TableRow key={item.paperid}>
                <TableCell>{item.examtitle}</TableCell>
                <TableCell align="right">${parseFloat(item.paperprice).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Total Price</TableCell>
              <TableCell align="right">${totalPrice.toFixed(2)}</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" color="primary">
          Confirm Order
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentConfirmation;
