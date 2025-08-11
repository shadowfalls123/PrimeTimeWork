import React from "react";
import {Typography, Box, Button, } from "@mui/material";
import { useNavigate } from "react-router-dom";
    
    const ReturnRefundPolicy = () => {
      const navigate = useNavigate();
      return (
        <Box sx={{ maxWidth: 800, margin: "20px auto", padding: "20px", lineHeight: 1.6 }}>
          <Typography variant="h4" gutterBottom>
            Return and Refund Policy
          </Typography>
          <Typography variant="body1" paragraph>
            At <strong>Exams Are Fun</strong>, we provide digital products such as mock exams, personality assessments, 
            and other digital tools. Due to the nature of these products, refunds are only granted in genuine cases. 
            By purchasing our services, you agree to the following return and refund terms:
          </Typography>
    
          <Typography variant="h6" gutterBottom>
            1. Non-Refundable Products
          </Typography>
          <Typography variant="body1" paragraph>
            Since our products are digital and accessible immediately upon purchase, they are non-refundable unless 
            there is a genuine issue with the service provided. Examples include:
          </Typography>
          <ul>
            <li>Technical issues that prevent access to the product.</li>
            <li>Incorrect or duplicate charges.</li>
          </ul>
    
          <Typography variant="h6" gutterBottom>
            2. Refund Processing
          </Typography>
          <Typography variant="body1" paragraph>
            - If a refund request is deemed valid, the refund will be credited to original payment method within <strong>10 days</strong> of approval. <br />
            - Refunds can be credited to the original payment method or, upon request, to your in-app wallet.
          </Typography>
    
          <Typography variant="h6" gutterBottom>
            3. Wallet Refunds
          </Typography>
          <Typography variant="body1" paragraph>
            - Refunds credited to your wallet will be processed within <strong>7 days</strong>. <br />
            - Wallet refunds can only be used for <strong>in-app purchases</strong> and are non-transferable or redeemable for cash.
          </Typography>
    
          <Typography variant="h6" gutterBottom>
            4. Refund Request Submission
          </Typography>
          <Typography variant="body1" paragraph>
            To submit a refund request, please contact our support team via our Contact Us page{" "}
            {/* <a href="mailto:support@examsarefun.com" style={{ color: "#007bff", textDecoration: "none" }}>
              {" "}support@examsarefun.com
            </a>  */}
            with the following information:
          </Typography>
          <ul>
            <li>Order details (Order ID, Date of Purchase)</li>
            <li>Reason for the refund request</li>
          </ul>
    
          <Typography variant="body1" paragraph>
            We are committed to resolving any issues promptly and ensuring customer satisfaction.
          </Typography>

                <br /><br />
              <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)} // Navigate to the previous page
            sx={{ marginBottom: '20px' }} // Add spacing below the button
          >
            Back
          </Button>
        </Box>
      );
    };
    
    export default ReturnRefundPolicy;
    
