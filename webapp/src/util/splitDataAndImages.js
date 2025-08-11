import logger from "./logger";
// // Utility function to split text and image data
// function splitData(data, imageType, passedImage) {
//   let images = {};

//   // Extract base64 image data (new images from <img> tags)
//   let updatedData = data.replace(/<img\s+src="([^"]+)"[^>]*>/g, (match, src) => {
//     // Create a variable name for the image based on the type provided
//     let imageVariableName = imageType;
//     images[imageVariableName] = src; // Store the new base64 image data
//     return `{${imageVariableName}}`; // Replace <img> tag with variable name
//   });

//   // If the placeholder is present and a passedImage is provided
//   if (updatedData.includes(`{${imageType}}`)) {
//     if (passedImage) {
//       updatedData = updatedData.replace(`{${imageType}}`, `<img src="${passedImage}" />`);
//       images[imageType] = passedImage; // Use the passed (old) image
//     }
//   } else {
//     // If no placeholder or <img> tag is present, mark the image for removal
//     images[imageType] = null;
//   }

//   // Return updated data and extracted images
//   return { updatedData, images };
// }

// Utility function to split text and image data
function splitData(data, imageType, passedPreviousImage) {
  let images = {};
  
  // Extract base64 image data (new images from <img> tags)
  // let hasImgTag = false; // To track if there is any <img> tag present
  let newImageFound = false; // Track if a new image is found and extracted
  // logger.log("splitData -- data ", data);
  let updatedData = data.replace(/<img\s+src="([^"]+)"[^>]*>/g, (match, src) => {
    logger.log("splitData -- imageType ", imageType);
    newImageFound = true; // A new image has been detected
    images[imageType] = src; // Store new base64 image data
    // logger.log("splitData -- images[imageType] ", images[imageType]);

    return `{${imageType}}`; // Replace <img> tag with variable name
  });

  // logger.log("splitData -- updatedData after extracting new image -->> ", updatedData);
  
  // If the placeholder {imageType} is present in the data
  if (updatedData.includes(`{${imageType}}`)) {
    // logger.log("splitData -- Inside if 1 ");

        // If a new image is NOT found and an old image exists, retain the old image
        if (!newImageFound && passedPreviousImage) {
          // logger.log("splitData -- Retaining old image");
    
          images[imageType] = passedPreviousImage; // Use the old image if no new image is detected
          // hasImgTag = true; // Mark that image exists, even if it's old
        }
      }
    
      // If no new image is present and no old image is retained, remove the placeholder from data
      if (!newImageFound && !passedPreviousImage) {
        // logger.log("splitData -- No new image, no old image, removing placeholder");
        updatedData = updatedData.replace(`{${imageType}}`, "").trim(); // Remove the placeholder
        images[imageType] = null; // Mark the image as removed
      }

  // Return updated data and extracted images
  return { updatedData, images };
}

// Function to process question and options data together
export function splitTextAndImageData(questionData, optionsData, answerExplanationData, questionImage, optionImages, ansExpImage) {
  // logger.log("questionData -->> ", questionData);
  // logger.log("optionsData -->> ", optionsData);
  // logger.log("questionImage -->> ", questionImage);
  // logger.log("optionImages -->> ", optionImages);
  // logger.log("answerExplanationData -->> ", answerExplanationData);
  // logger.log("ansExpImage -->> ", ansExpImage);
  // Process the question data, passing the questionImage (old image) to retain if needed
  let { updatedData: updatedQuestion, images: questionImages } = splitData(questionData, "questionImage", questionImage);

   // Process the anserExplaination data, passing the ansExpImage (old image) to retain if needed
   let { updatedData: updatedAnswerExplanation, images: ansExpImages } = splitData(answerExplanationData, "ansExpImage", ansExpImage);

  // Process each option's data individually, passing the respective option image
  let processedOptions = optionsData.map((option, index) => {
    let { updatedData, images } = splitData(option, `option${index + 1}Image`, optionImages[index]);
    return { updatedOption: updatedData, optionImages: images };
  });

  // Combine the extracted images from options and question
  let combinedImages = {
    ...questionImages,
    ...processedOptions.reduce((acc, opt) => ({ ...acc, ...opt.optionImages }), {}),
    ...ansExpImages
  };

  // Filter out images marked for removal (null)
  Object.keys(combinedImages).forEach(key => {
    if (combinedImages[key] === null) {
      delete combinedImages[key];
    }
  });

  // Return the processed question, options, and images
  return {
    updatedQuestion,
    updatedOptions: processedOptions.map(opt => opt.updatedOption),
    updatedAnswerExplanation,
    combinedImages,
  };
}
