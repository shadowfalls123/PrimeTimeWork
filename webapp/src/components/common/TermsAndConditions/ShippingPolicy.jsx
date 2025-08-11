import React from "react";
import {Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ShippingPolicy = () => {
    const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 800, margin: "20px auto", padding: "20px", lineHeight: 1.6 }}>
    <div className="shipping-policy-container">
      <h1>Shipping Policy</h1>
      <p>
        Welcome to <strong>Exams Are Fun</strong>. This Shipping Policy outlines the terms and conditions related to the delivery of our products and services. Please read this policy carefully to understand how we process and deliver orders for our mock exam services.
      </p>

      <h2>1. Nature of Products</h2>
      <p>
        All products offered on our website are digital in nature, including but not limited to:
        <ul>
          <li>Mock exam access</li>
          <li>Practice tests</li>
          <li>Answer keys and solutions</li>
          <li>Performance reports and analytics</li>
        </ul>
        No physical shipping is involved unless explicitly stated otherwise.
      </p>

      <h2>2. Delivery of Services</h2>
      <p>
        <strong>Immediate Access:</strong> Once your payment is successfully processed, you will receive access to the purchased exams and related materials. Delivery is immediate unless specified.
      </p>
      <p>
        <strong>Account Access:</strong> All purchased content is delivered via your account dashboard on our platform. Ensure that you log in using the correct credentials to access your content.
      </p>
      {/* <p>
        <strong>Email Confirmation:</strong> A confirmation email will be sent to the registered email address with details of your purchase and instructions for access.
      </p> */}

      <h2>3. Failed Delivery</h2>
      {/* <p>
        <strong>Email Issues:</strong> If you do not receive a confirmation email, please check your spam/junk folder or contact our support team at <a href="mailto:support@yourwebsite.com">support@yourwebsite.com</a>.
      </p> */}
      <p>
        <strong>Dashboard Errors:</strong> If the purchased content is not visible in your account dashboard, contact our support team immediately to resolve the issue.
      </p>

      <h2>4. Shipping Charges</h2>
      <p>As all our products are delivered digitally, there are no shipping charges applicable.</p>

      <h2>5. Delivery Timeframe</h2>
      <p>
        Digital products are typically delivered instantly upon successful payment. In case of technical issues or delays, delivery may take up to 24-72 hours. We will notify you promptly if there is any delay. Please reach us via our Contact Us page and log your issue for timely resolution.
      </p>

      <h2>6. Technical Requirements</h2>
      <p>
        To access our mock exams and services, ensure that you have:
        <ul>
          <li>A stable internet connection</li>
          <li>A compatible device (e.g., laptop, tablet, or smartphone)</li>
          <li>Up-to-date web browsers (e.g., Chrome, Firefox, Safari)</li>
        </ul>
      </p>

      <h2>7. Incorrect Information</h2>
      <p>
        You are responsible for providing accurate details (e.g., email address) during registration. If incorrect details are provided, we cannot guarantee successful delivery of our services. Please contact support to rectify any errors in your account.
      </p>

      <h2>8. Refunds and Returns</h2>
      <p>
        Please refer to our <a href="/refund-policy">Refund Policy</a> for detailed information on cancellations, refunds, and returns for digital products.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We reserve the right to update or modify this Shipping Policy at any time without prior notice. Any changes will be effective immediately upon posting on this page. Please check back periodically to stay informed.
      </p>

      <h2>10. Contact Information</h2>
      <p>
        If you have any questions or concerns about this Shipping Policy, please reach us via our Contact Us page.
      </p>

      <br /><br />
    <Button
  variant="contained"
  color="primary"
  onClick={() => navigate(-1)} // Navigate to the previous page
  sx={{ marginBottom: '20px' }} // Add spacing below the button
>
  Back
</Button>
    </div>
    </Box>
    
  );
};

export default ShippingPolicy;
