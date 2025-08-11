import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { saveContactUsMessage } from "../../../services";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import CircularProgress from '@mui/material/CircularProgress';

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
    <Container maxWidth="md" style={{ marginTop: "0rem" }}>
      <Typography variant="h4" gutterBottom>
        Contact Us 
      </Typography>
      {/* <Typography variant="h6" gutterBottom>
        We are also reachable at - examsarefun.help@gmail.com
      </Typography> */}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="Message"
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
        title="Contact Us"
        message="Thank you for contacting us. We will get back to you soon."
        showOnlyOkButton={true} // Show only the OK button
      />
    </Container>
  );
};

export default ContactUs;
