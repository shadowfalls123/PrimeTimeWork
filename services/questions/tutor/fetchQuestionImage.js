
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";

// Setup S3 Client
const s3 = AWSClients.s3();

// Fetch fetchQuestionImage for logged in user
export const fetchQuestionImage = async (request, response) => {
  console.log("Inside fetchQuestionImage request 1.0 ");
  console.log("Inside fetchQuestionImage request ", request);
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);
    const paperid = request.pathVariables.pid;
    const questionid = request.pathVariables.qid;

    // Get user profile data from the database
    const questionsImage = await getQuestionImage(paperid, questionid);
    return { statusCode: 200, body: JSON.stringify(questionsImage) };

  } catch (err) {
    console.log("Error fetching user profile:", err);
    return { statusCode: 500, body: "Error fetching user profile" };
  }
};

// Function to get user profile image from S3
const getQuestionImage = async (paperid, questionid) => {
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `questionsimages/${paperid}/${questionid}.jpg` // Use the key format used during upload
  };

  try {
    const s3ImageData = await s3.getObject(s3Params).promise();
    
    // Convert the text file data to a string and parse it as JSON
    const questionsimage = s3ImageData.Body.toString("utf-8");
    return questionsimage;

    // // Convert image data to base64
    // const questionsimage = s3ImageData.Body.toString("base64");
    // return questionsimage;
  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("image not found for question:");
      // Optionally, you can set a default image or handle the absence of a profile image here
      // return ''; // Set a default image or handle the absence accordingly
      return null; // Or return null indicating absence of profile image
    } else {
      console.log("Error retrieving profile image from S3:", s3Error);
      throw s3Error;
    }
  }
};