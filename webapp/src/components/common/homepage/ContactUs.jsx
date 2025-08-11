import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { saveContactUsMessage } from "../../../services";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import CircularProgress from '@mui/material/CircularProgress';
import Box from "@mui/material/Box";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactSuccessDialogOpen, setContactSuccessDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleContactSuccessDialogClose = () => {
    setContactSuccessDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when submitting
    const msgData = JSON.stringify(formData);
    try {
      const response = await saveContactUsMessage(msgData);
      await response;
      setContactSuccessDialogOpen(true);
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false); // Set loading to false after submission
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem", paddingBottom: "2rem" }}>
      <Typography variant="h5" gutterBottom align="center" style={{ fontWeight: "bold" }}>
        We&apos;d Love to Hear From You!
      </Typography>
      <Typography variant="h7" gutterBottom align="center" style={{ marginBottom: "2rem" }}>
        Whether you have questions, feedback, or just want to say hi, we&apos;re here to listen. Your thoughts and insights help us grow and improve.
      </Typography>

      <Box mb={4} textAlign="center">
        <Typography variant="h7" style={{ fontWeight: "bold" }}>Quick Contact</Typography>
        <Typography variant="body1">📧 Email us at: <a href="mailto:kodinghut@gmail.com">kodinghut@gmail.com</a></Typography>
        <Typography variant="body1">📞 Call us at: +91 11111 11111</Typography>
      </Box>

      <Typography variant="h6" gutterBottom style={{ marginBottom: "1.5rem" }}>
        Drop Us a Message
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Your Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Your Message"
          name="message"
          multiline
          rows={4}
          value={formData.message}
          onChange={handleChange}
          margin="normal"
          required
        />

        {isLoading ? (
          <CircularProgress style={{ marginTop: "1rem" }} />
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: "1rem" }}
          >
            Submit
          </Button>
        )}
      </form>
      <ConfirmationDialog
        open={contactSuccessDialogOpen}
        onClose={handleContactSuccessDialogClose}
        onConfirm={handleContactSuccessDialogClose} // Close the dialog when OK button is clicked
        title="Thank You!"
        message="Your message has been successfully sent. We appreciate you reaching out and will respond as soon as possible."
        showOnlyOkButton={true} // Show only the OK button
      />
    </Container>
  );
};

export default ContactUs;
