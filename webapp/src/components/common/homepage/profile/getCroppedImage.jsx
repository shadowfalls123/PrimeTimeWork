export const getCroppedImage = (image, crop, resizedImgHeight, resizedImgWidth) => {
    return new Promise((resolve, reject) => {
      const imageObj = new Image();
      imageObj.src = image;
  
      imageObj.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        const pixelRatio = window.devicePixelRatio || 2;
        const resizedWidth = resizedImgWidth * pixelRatio;
        const resizedHeight = resizedImgHeight * pixelRatio;
  
        canvas.width = resizedWidth;
        canvas.height = resizedHeight;
        ctx.drawImage(
          imageObj,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          resizedWidth,
          resizedHeight
        );
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          1
        );
      };
  
      imageObj.onerror = (error) => {
        reject(error);
      };
    });
  };
  