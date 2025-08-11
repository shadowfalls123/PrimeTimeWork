import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cropper from "react-easy-crop";
import EditIcon from "@mui/icons-material/Edit";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { resizeImage } from "./resizeImage";
import { getCroppedImage } from "./getCroppedImage";

const ImageUploader = ({ onImageUpload, onImageDelete, fetchedImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedImageBlob, setCroppedImageBlob] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
//  const [isEditing, setIsEditing] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    if (fetchedImage) {
      setUploadComplete(true);
    }
  }, [fetchedImage]);

  const handleCropChange = (crop) => setCrop(crop);
  const handleZoomChange = (zoom) => setZoom(zoom);

  const handleCropComplete = async (croppedArea, croppedAreaPixels) => {
    if (selectedImage) {
      const resizedImgHeight = 120;
      const resizedImgWidth = 120;

      const croppedImageBlob = await getCroppedImage(
        selectedImage,
        croppedAreaPixels,
        resizedImgHeight,
        resizedImgWidth
      );
      setCroppedImageBlob(croppedImageBlob);
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
//        setIsEditing(true);
        setUploadComplete(false);  // Reset upload status
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  const handleImageUpload = async () => {
    const maxWidth = 120;
    const maxHeight = 120;
    const imageToUpload = croppedImageBlob ? URL.createObjectURL(croppedImageBlob) : selectedImage;
    const resizedImageBlob = await resizeImage(imageToUpload, maxWidth, maxHeight);

    const base64String = await blobToBase64(resizedImageBlob);
    await onImageUpload(base64String);
    setSuccessDialogOpen(true); // Open success dialog
//    setIsEditing(false);
    setUploadComplete(true);  // Mark upload as complete
  };

  const handleImageDelete = () => {
    onImageDelete();
    setSelectedImage(null);
    setCroppedImageBlob(null);
//    setIsEditing(false);
    setUploadComplete(false);  // Reset upload status
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <div>
      <div style={{ position: "relative", width: 120, height: 120, overflow: "hidden", borderRadius: "50%" }}>
        {selectedImage ? (
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            onCropChange={handleCropChange}
            onZoomChange={handleZoomChange}
            onCropComplete={handleCropComplete}
            cropShape="round"
            aspect={1}
          />
        ) : fetchedImage ? (
          <img
            src={fetchedImage}
            alt="Profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="image-input" />
            <label htmlFor="image-input" style={{ cursor: "pointer" }}>
              <EditIcon fontSize="large" color="primary" />
            </label>
          </div>
        )}
      </div>
      <div style={{ display: "flex", marginTop: "1rem" }}>
        {croppedImageBlob && !uploadComplete && (
          <Button variant="contained" color="primary" onClick={handleImageUpload}>
            Upload Image
          </Button>
        )}
        {uploadComplete && (
          <>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="image-edit-input" />
            <label htmlFor="image-edit-input" style={{ cursor: "pointer", marginLeft: "1rem" }}>
              <Button variant="contained" color="primary" onClick={() => document.getElementById('image-edit-input').click()}>
                Edit Image
              </Button>
            </label>
            <Button variant="contained" color="secondary" onClick={handleImageDelete} style={{ marginLeft: "1rem" }}>
              Delete Image
            </Button>
          </>
        )}
      </div>
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>Image uploaded successfully.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

ImageUploader.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func.isRequired,
  fetchedImage: PropTypes.string,
};

export default ImageUploader;
