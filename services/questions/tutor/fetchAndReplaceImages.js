
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";

// Setup S3 Client
const s3 = AWSClients.s3();

export const fetchAndReplaceImages = async (paperId, questionsData) => {
  // Step 1: Fetch all objects in the paper folder
  const params = {
    Bucket: assetBucket,
    Prefix: `questionsimages/${paperId}/`
  };

  try {
    const allObjects = await s3.listObjectsV2(params).promise();
    const imageFiles = allObjects.Contents;
    console.log("Fetched image files:", imageFiles);

    // Step 2: Create a mapping of question IDs to base64-encoded image data
    const imageMap = {};
    for (const file of imageFiles) {
      const key = file.Key;
      const questionId = key.split('/').pop().split('.')[0]; // Extract questionId from filename

      // Fetch image data for each file
      const imageData = await s3.getObject({ Bucket: assetBucket, Key: key }).promise();
      const utf8Image = imageData.Body.toString('utf-8');
      const parsedImageData = JSON.parse(utf8Image); // Parse the image JSON structure

      // Map questionId to its images (questionImage, option1Image, etc.)
      imageMap[questionId] = parsedImageData;
    }

    // Step 3: Replace placeholders in questionsData
    const updatedQuestionsData = questionsData.map(question => {
//      const { quesid, qtxt, op1, op2, op3, op4 } = question;
      const { quesid, qtxt, op1, op2, op3, op4, op5, explanation } = question;

      // Replace question image placeholder with Image
      if (imageMap[quesid]?.questionImage && qtxt.includes("{questionImage}")) {
        question.qtxt = qtxt.replace("{questionImage}", `<img src="${imageMap[quesid].questionImage}" />`);
      }

      // Replace Answer Explaination image placeholder with Image
      if (imageMap[quesid]?.ansExpImage && explanation.includes("{ansExpImage}")) {
        question.explanation = explanation.replace("{ansExpImage}", `<img src="${imageMap[quesid].ansExpImage}" />`);
      }

      // Replace option images placeholders
      for (let i = 1; i <= 5; i++) {
        const optionPlaceholder = `{option${i}Image}`;
        const optionKey = `op${i}`;
        const optionImageKey = `option${i}Image`; // Use keys like option1Image, option2Image, etc.

        if (
          question[optionKey] &&
          question[optionKey].includes(optionPlaceholder) &&
          imageMap[quesid]?.[optionImageKey]
        ) {
          question[optionKey] = question[optionKey].replace(optionPlaceholder, `<img src="${imageMap[quesid][optionImageKey]}" />`);
        }
      }

      return question;
    });

    return updatedQuestionsData;
  } catch (error) {
    console.error("Error fetching images or replacing placeholders:", error);
    throw new Error("Failed to fetch images or update questions data");
  }
};