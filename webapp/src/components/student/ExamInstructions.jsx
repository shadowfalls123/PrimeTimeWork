import React, { useState } from "react";
import logger from "../../util/logger";
//import { useNavigate } from "react-router-dom";
//import { getExamQuestions } from "../../services";
import { useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
//import MuiAlert from "@mui/material/Alert";
import { Button, Container, CircularProgress } from "@mui/material";
import ConfirmationDialog from "../common/ConfirmationDialog";
// function Alert(props) {
//   return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

function ExamInstructions() {
  const location = useLocation();
  const selectedPaper = location.state?.paper || null; // use optional chaining and nullish coalescing to handle null/undefined
  const selectedPack = location.state?.selectedPack || null; // selectedPack object

  // if (!selectedPaper) {
  //   return <div>Loading...</div>; // or handle other cases where result is null/undefined
  // }

  const cardStyle = {
    border: '1px solid #ccc', // Add your preferred border style
    borderRadius: '8px', // Add border radius for rounded corners
    padding: '15px', // Add padding for spacing
    marginBottom: '15px', // Optional margin at the bottom
  };

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
 // const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [openIsExamStartConfirmDialog, setOpenIsExamStartConfirmDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Introduce loading state
  //const [isExamStartConfirmed, setIsExamStartConfirmed] = useState(false);

  //Below function was fetching the exam data in exam instrutions and was passing it to ExamPage. Moving the logic of fetching exam question directly in ExamPage
  // const handleStartExam = async () => {
  //   setIsLoading(true); // Set loading state to true when starting exam
  //   try {
  //     const response = await getExamQuestions(selectedPaper.pid, selectedPack.packid);
  //     logger.log(" In handleStartExam response is -> ", response);
  //     // Check if response contains data
  //   if (!response || response.length === 0) {
  //       setOpenDialog(true);
  //       setDialogTitle("Error");
  //       setDialogMessage("Exam questions not available");
  //       setIsLoading(false); // Set loading state to false on error
  //     return; // Exit function
  //   }
  //     const data = await response;
  //     setIsLoading(false); // Set loading state to false on success
  //     logger.log(" In handleStartExam data is -> ", data);
  //     const examTime = selectedPaper.examtime;
  //     navigate("/exam", { state: { data, examTime, selectedPaper, selectedPack } });
  //   } catch (err) {
  //     console.error(err);
  //     setOpenDialog(true);
  //     setDialogTitle("Error");
  //     setDialogMessage("Failed to fetch submitted papers");
  //     setIsLoading(false); // Set loading state to false on error
  //   }
  // };

  // const handleStartExam = () => {
  //   setIsLoading(true); // Show loading spinner
  //   setOpenDialog(true);
  //   setDialogTitle("Confirmation");
  //   setDialogMessage("Have you read all the instructions ? Are you sure you want to start the Exam ?");
  //   const examTime = selectedPaper.examtime;
  //   navigate("/exam", { state: { examTime, selectedPaper, selectedPack } });
  //   setIsLoading(false);
  // };

  const handleStartExam = () => {
    setOpenIsExamStartConfirmDialog(true); // Show confirmation dialog
    setDialogTitle("Confirmation");
    setDialogMessage("Have you read all the instructions? Are you sure you want to start the Exam?");
  };

  const handleConfirmStartExam = () => {
    setOpenIsExamStartConfirmDialog(false); // Close the dialog
    const examTime = selectedPaper.examtime;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const windowFeatures = `width=${screenWidth},height=${screenHeight},top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no`;
    const examWindow = window.open(`/exam`, "ExamWindow", windowFeatures);

    if (examWindow) {
        const examLoadingData = { examTime, selectedPaper, selectedPack };
        logger.log("[Parent] Preparing to send exam data:", examLoadingData);

        // Handle handshake with the child
        const handshakeListener = (event) => {
            if (event.origin !== window.location.origin) {
                console.warn("Ignoring message from untrusted origin:", event.origin);
                return;
            }

            if (event.data === "childReady") {
                logger.log("[Parent] Child is ready. Sending data...");
                examWindow.postMessage(
                    { type: "examData", payload: examLoadingData },
                    window.location.origin
                );

                // Clean up the listener
                window.removeEventListener("message", handshakeListener);
            }
        };

        // Add the event listener for the handshake
        window.addEventListener("message", handshakeListener);

        // Optional: Timeout in case the child doesn't respond
        setTimeout(() => {
            console.error("[Parent] Child did not respond in time. Removing listener.");
            window.removeEventListener("message", handshakeListener);
        }, 5000);
    } else {
        console.error("[Parent] Failed to open exam window.");
        setOpenDialog(true);
      setDialogTitle("Error");
      setDialogMessage("Unable to open the exam window. Please disable your popup blocker.");
    }
    setOpenDialog(false);
    setIsLoading(false);
};


//   const handleConfirmStartExam = () => {
// //    setIsExamStartConfirmed(true); // User confirmed
//     setOpenIsExamStartConfirmDialog(false); // Close the dialog
// //    setIsLoading(true);
//     const examTime = selectedPaper.examtime;
//     logger.log("In handleDialogConfirm Exam time is -> ", examTime);
//     const screenWidth = window.screen.width;
//   const screenHeight = window.screen.height;

//   const windowFeatures = `width=${screenWidth},height=${screenHeight},top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no`;

// //    const windowFeatures = "width=800,height=600,top=100,left=100,resizable=no,menubar=no,toolbar=no,location=no,status=no,scrollbars=no";
// //    const windowFeatures = ""; //For testing
// //    const examWindow = window.open(`/exam`, "ExamWindow", windowFeatures);
//     //   const examWindow = window.open(
//     //   "",
//     //   "_blank",
//     //   "toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=800,height=600"
//     // );
//     const examWindow = window.open(`/exam`, "ExamWindow", windowFeatures);
//     let intervalId;
//     const examLoadingData = { examTime, selectedPaper, selectedPack };
//     if (examWindow) {
//       logger.log("[ExamInstructions] In examWindow.onload window.location.origin -->> ", window.location.origin);
//       logger.log("[ExamInstructions] In examWindow.onload examTime -->> ", examTime);
//       logger.log("[ExamInstructions] In examWindow.onload selectedPaper -->> ", selectedPaper);
//       logger.log("[ExamInstructions] In examWindow.onload selectedPack -->> ", selectedPack);

//       intervalId = setInterval(() => {
//         // const dataToSend = { type: "customType", payload: { key: examLoadingData } };
//         // examWindow.postMessage(dataToSend, window.location.origin);

//         setTimeout(() => {
//           const dataToSend = { type: "customType", payload: { key: examLoadingData } };
//           examWindow.postMessage(dataToSend, window.location.origin);
//       }, 500);
//         // examWindow.postMessage(
//         //   { examTime, selectedPaper, selectedPack },
//         //   window.location.origin
//         // );
//       }, 100);
    
//       examWindow.onload = () => {
//         logger.log("[ExamInstructions] Window is loaded");
//         clearInterval(intervalId);
//       };

//       // // Send exam data to the new window after it loads
//       // examWindow.onload = () => {

//       //   examWindow.postMessage(
//       //     { examTime, selectedPaper, selectedPack },
//       //     window.location.origin
//       //   );
//       // };
//     } else {
//       setOpenDialog(true);
//       setDialogTitle("Error");
//       setDialogMessage("Unable to open the exam window. Please disable your popup blocker.");
//     }
//     setOpenDialog(false);
//     setIsLoading(false);
//   };

  const handleCancelStartExam = () => {
//    setIsExamStartConfirmed(false); // User canceled
    setOpenIsExamStartConfirmDialog(false); // Close the dialog
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setIsSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "0rem" }}>
    <div className="exam-instructions">
    <div className="LoginPage" style={{ textAlign: 'center', marginTop: '1px' }}>
      <h2>Exam Instructions</h2>
      </div>

      <strong>
        <p>Please read the instructions carefully before starting the exam.</p>
      </strong>

      <div className="exam-card" style={cardStyle}>
      <div className="card-header">
        <strong>Pack -</strong> {selectedPack ? selectedPack.packTitle : "N/A"}
      </div>
      <div className="card-header">
        <strong>Exam Paper -</strong> {selectedPaper.papertitle}
      </div>
      <div className="card-content">
        <strong>Exam Brief -</strong> {selectedPaper.paperdesc}
      </div>
      <div className="card-content">
        <strong>Total Questions -</strong> {selectedPaper.qcount}
      </div>
      <div className="card-content">
        <strong>Exam Duration -</strong> {selectedPaper.examtime} mins
      </div>
    </div>

      <Button variant="contained" color="primary" onClick={handleStartExam}>
          {isLoading ? <CircularProgress size={24} /> : "Start Exam"} {/* Render loading indicator when isLoading is true */}
        </Button>

      <section>
        <h3>Before you begin:</h3>
        <ol>
          <li>
            <strong>Technical Requirements:</strong>
            <ul>
              <li>Ensure you have a stable internet connection.</li>
              <li>
                Use a reliable device with a fully charged battery or plugged
                in.
              </li>
              <li>
                Use a supported web browser (Chrome, Firefox, Safari, or Edge)
                with the latest updates.
              </li>
            </ul>
          </li>
          <li>
            <strong>Secure Environment:</strong>
            <ul>
              <li>
                Choose a quiet and well-lit space to minimize distractions.
              </li>
              <li>Close all unnecessary applications and tabs.</li>
              <li>
                Inform those around you about the exam to avoid interruptions.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h3>During the exam:</h3>
        <ol>
          <li>
            <strong>Time Management:</strong>
            <ul>
              <li>Keep track of the time allocated for exam.</li>
              <li>Be aware of the overall time limit for the entire exam.</li>
              <li>
                The exam paper will be submitted automatically once the
                designated exam time has elapsed.
              </li>
            </ul>
          </li>
          <li>
            <strong>Navigation:</strong>
            <ul>
              <li>
                Navigate through the exam using the provided controls only.
              </li>
              <li>
                Do not use browser back/forward buttons; it may result in data
                loss.
              </li>
            </ul>
          </li>
          <li>
            <strong>Answer Submission:</strong>
            <ul>
              <li>
                Clicking on the choice (radio button) shows that you have picked
                that answer for the question.
              </li>
            </ul>
          </li>
          <li>
            <strong>Technical Support:</strong>
            <ul>
              <li>
                If you encounter technical issues, immediately contact the
                provided support channels.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h3>Exam Integrity:</h3>
        <ol>
          <li>
            <strong>Individual Work:</strong>
            <ul>
              <li>
                The exam must be completed individually; collaboration is
                strictly prohibited.
              </li>
              <li>Any form of cheating will result in disqualification.</li>
            </ul>
          </li>
          <li>
            <strong>Browser Restrictions:</strong>
            <ul>
              <li>
                Do not attempt to open other browser tabs or windows during the
                exam.
              </li>
            </ul>
          </li>
          <li>
            <strong>Communication:</strong>
            <ul>
              <li>Do not communicate with others or use any external aids.</li>
              <li>
                Webcam and microphone may be monitored for exam integrity.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <section>
        <h3>After the exam:</h3>
        <ol>
          <li>
            <strong>Submission Confirmation:</strong>
            <ul>
              <li>Ensure your exam submission is confirmed on-screen.</li>
              <li>Save or print your confirmation for your records.</li>
            </ul>
          </li>
          <li>
            <strong>Feedback:</strong>
            <ul>
              <li>
                Provide feedback on any technical issues or concerns encountered
                during the exam.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <p>
        Remember to carefully read and follow all instructions. Failure to
        adhere to these guidelines may result in the invalidation of your exam.
      </p>

      <p>Best of luck!</p>

      <div>
        <Button variant="contained" color="primary" onClick={handleStartExam}>
          {isLoading ? <CircularProgress size={24} /> : "Start Exam"} {/* Render loading indicator when isLoading is true */}
        </Button>
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          {/* <MuiAlert onClose={handleSnackbarClose} severity="error">
            {snackbarMessage}
          </MuiAlert> */}
        </Snackbar>
      </div>
      <div>
          <ConfirmationDialog
            open={openDialog}
            onClose={handleDialogClose}
            onConfirm={handleDialogClose} // Close the dialog when OK button is clicked
            title={dialogTitle}
            message={dialogMessage}
            showOnlyOkButton={true}
          />
        <ConfirmationDialog
            open={openIsExamStartConfirmDialog}
            onClose={handleCancelStartExam}
            onConfirm={handleConfirmStartExam} // Close the dialog when OK button is clicked
            title={dialogTitle}
            message={dialogMessage}
          />
        </div>
    </div>
    </Container>
  );
}

export default ExamInstructions;
