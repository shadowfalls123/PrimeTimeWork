import React from "react";
import { makeStyles } from "@mui/styles";
import { Paper, Typography, Grid, Button, Box } from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PropTypes from "prop-types";
import ExamsAreFunLogo from "../../srcimages/examsarefun.png";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    maxWidth: "800px", // Adjusted width for landscape orientation
    margin: "auto",
    marginTop: theme.spacing(4),
    border: "2px double #000", // Add double-line border
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  signature: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(1),
    borderTop: "2px solid #000", // Add border to signature box
    paddingTop: theme.spacing(4),
  },
}));

const Certificate = ({ studentName, subjectName, score, totalQuestions }) => {
  const classes = useStyles();

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "landscape", // Set orientation to landscape
      unit: "in", // Set unit to inches
      format: [11, 8.5], // Set page size to 8.5 in x 11 in (Letter size)
    });

    html2canvas(document.getElementById("certificate")).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      //      doc.addImage(imgData, "PNG", 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
      doc.addImage(imgData, "PNG", 0, 0, 11, 8.5); // Add image to PDF with specified dimensions

      doc.save("certificate.pdf");
    });
  };

  const formattedDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <Box sx={{ border: "2px solid black", padding: "20px" }}>
      <Paper className={classes.root} elevation={3} id="certificate">
        <Box sx={{ border: "2px solid black", padding: "20px" }}>
          <div
            style={{
              backgroundColor: "blue",
              width: "100%",
              textAlign: "left",
              padding: "20px 0",
              marginBottom: "20px",
            }}
          >
            <img
              src={ExamsAreFunLogo}
              alt="ExamsAreFun Logo"
              style={{ width: "100px", marginLeft: "20px" }}
            />
          </div>

          <Typography variant="h4" className={classes.title}>
            Certificate of Achievement
          </Typography>
          <Typography
            variant="body1"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          >
            This is to certify that <strong>{studentName}</strong> has
            successfully completed the exam on <strong>{subjectName}</strong>{" "}
            with a score of <strong>{(score * 100) / totalQuestions}%</strong>.
          </Typography>

          <Typography variant="body1" className={classes.signature}>
            Digitally Signed by ExamsAreFun
          </Typography>
          <Typography variant="body1" style={{ marginBottom: "40px" }}>
            Signed Date {formattedDate()}
          </Typography>
          <Typography
            variant="body1"
            style={{ marginBottom: "10px", fontSize: "12px" }}
          >
            Note: For Printed certificates please get in touch with our Admin
            team.
          </Typography>
          <Typography
            variant="body1"
            style={{ marginBottom: "20px", fontSize: "12px" }}
          >
            Disclaimer: This certificate is issued based on the marks score by
            the candidate and is subject to verification.
          </Typography>
        </Box>
      </Paper>
      <Grid container justifyContent="center">
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download Certificate
        </Button>
      </Grid>
    </Box>
  );
};

Certificate.propTypes = {
  studentName: PropTypes.string.isRequired,
  subjectName: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
};

export default Certificate;
