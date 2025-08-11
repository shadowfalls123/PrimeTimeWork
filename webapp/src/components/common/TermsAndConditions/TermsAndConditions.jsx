import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <Container maxWidth="md" style={{ marginTop: '20px', marginBottom: '20px' }}>
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Terms and Conditions
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to our website. By accessing or using this website, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you concerning this website.
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By accessing and using this website, you accept and agree to be bound by the terms and conditions outlined in this document. If you disagree with any part of these terms, please do not use our website.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Use of Website
        </Typography>
        <Typography variant="body1" paragraph>
          This website is intended for lawful purposes only. Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offense.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
          <br />
          Please review our detailed{" "} 
          <Link to="/privacy-policy" style={{ color: "#007bff", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Return and Refund Policy
        </Typography>
        <Typography variant="body1" paragraph>
          At Exams Are Fun, we provide digital products such as mock exams, personality assessments, and other digital tools. Due to the nature of these products, refunds are only granted in genuine cases. 
          <br />
          Please review our detailed{" "} 
          <Link to="/return-policy" style={{ color: "#007bff", textDecoration: "underline" }}>
          Return and Refund Policy
        </Link>
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Shipping Policy
        </Typography>
        <Typography variant="body1" paragraph>
          All products offered on our website are digital in nature. No physical shipping is involved unless explicitly stated otherwise. 
          <br />
          Please review our detailed{" "} 
          <Link to="/shipping-policy" style={{ color: "#007bff", textDecoration: "underline" }}>
          Shipping Policy
        </Link>
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          We shall not be held liable for any indirect, incidental, or consequential damages arising from the use of this website or our products/services.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These terms and conditions are governed by and construed in accordance with the laws of Pune, and any disputes will be subject to the exclusive jurisdiction of the courts in that location.
        </Typography>

        <Typography variant="h6" gutterBottom>
          8. Changes to Terms
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to modify these terms and conditions at any time without prior notice. Your continued use of the website following any changes signifies your acceptance of the new terms.
        </Typography>
        <Typography variant="body1" marginTop="10px">
          This website is owned and managed by Manisha Chaudhary 
        </Typography>

        <Typography variant="body1" align="center" marginTop="20px">
          Last Updated: [21-Jan-2025]
        </Typography>
      </Box>
    </Container>
  );
};

export default TermsAndConditions;
