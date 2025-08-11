import React from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

// function CustomDialog({ open, onClose, onConfirm, title, message, showOnlyOkButton }) {
  function CustomDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    showOnlyOkButton = false, // Default value assigned here
  }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {showOnlyOkButton ? (
          <Button onClick={onClose} color="primary" autoFocus>
            OK
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button onClick={onConfirm} color="primary" autoFocus>
              Confirm
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

CustomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  showOnlyOkButton: PropTypes.bool, // Optional prop to show only the OK button
};

// CustomDialog.defaultProps = {
//   showOnlyOkButton: false, // By default, both buttons are shown
// };

export default CustomDialog;
