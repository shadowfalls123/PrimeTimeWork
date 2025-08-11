import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 800, margin: "20px auto", padding: "20px", lineHeight: 1.6 }}>
      <Typography variant="h4" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="body1" paragraph>
        At <strong>Exams Are Fun</strong>, we respect your privacy and are committed to protecting your personal data. 
        This Privacy Policy outlines how we collect, use, and safeguard the information you provide when using our services.
      </Typography>

      <Typography variant="h6" gutterBottom>
        1. Information We Collect
      </Typography>
      <Typography variant="body1" paragraph>
        When you use our services, we may collect the following information:
      </Typography>
      <ul>
        <li><strong>Personal Information:</strong> Your name, email address, phone number, and mailing address.</li>
        <li><strong>Location Information:</strong> Your city, state, and country for shipping and service personalization.</li>
        <li><strong>Usage Data:</strong> Information about your interaction with our platform, such as pages visited and activities performed.</li>
      </ul>

      <Typography variant="h6" gutterBottom>
        2. How We Use Your Information
      </Typography>
      <Typography variant="body1" paragraph>
        We use the information collected for the following purposes:
      </Typography>
      <ul>
        <li>To provide and improve our services, including mock exams and assessments.</li>
        <li>To process your orders and provide customer support.</li>
        <li>To personalize your experience and suggest relevant content or offers.</li>
        <li>To analyze usage data and generate insights for enhancing our platform.</li>
        <li>To send you updates, notifications, and promotional materials (if you opt-in).</li>
      </ul>

      <Typography variant="h6" gutterBottom>
        3. Sharing Your Information
      </Typography>
      <Typography variant="body1" paragraph>
        We do not sell or share your personal data with third parties for marketing purposes. However, we may share your information with:
      </Typography>
      <ul>
        <li>Service providers who assist us in operating our platform, such as payment processors or analytics providers.</li>
        <li>Legal authorities, if required by law or to protect our legal rights.</li>
      </ul>

      <Typography variant="h6" gutterBottom>
        4. Data Security
      </Typography>
      <Typography variant="body1" paragraph>
        We take appropriate security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. 
        However, no data transmission over the internet or electronic storage is entirely secure, and we cannot guarantee absolute security.
      </Typography>

      <Typography variant="h6" gutterBottom>
        5. Your Rights
      </Typography>
      <Typography variant="body1" paragraph>
        You have the right to:
      </Typography>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request corrections to your personal data if it is inaccurate or incomplete.</li>
        <li>Request deletion of your personal data (subject to legal obligations).</li>
        {/* <li>Opt-out of receiving promotional emails by using the "unsubscribe" link in our communications.</li> */}
      </ul>

      <Typography variant="h6" gutterBottom>
        6. Updates to this Privacy Policy
      </Typography>
      <Typography variant="body1" paragraph>
        We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. 
        The updated policy will be posted on this page, and we encourage you to review it regularly.
      </Typography>

      <Typography variant="h6" gutterBottom>
        7. Contact Us
      </Typography>
      <Typography variant="body1" paragraph>
        If you have any questions or concerns about this Privacy Policy, please contact us via our Contact Us page 
        {/* <a href="mailto:privacy@examsarefun.com" style={{ color: "#007bff", textDecoration: "none" }}>
          {" "}privacy@examsarefun.com
        </a>. */}
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

export default PrivacyPolicy;
