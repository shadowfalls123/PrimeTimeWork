import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";
import { zipData, unzipData } from "../utils/zipUnzip";
import { getUserProfileData } from "../common_functions/getUserProfileData";

// Setup S3 Client
const s3 = AWSClients.s3();

//Save User Feedback for the paper after the user has completed the exam
export const saveUserFeedback = async (request, response) => {
  try {
    console.log("Inside saveUserFeedback request 1.0 ");
    console.log("Inside saveUserFeedback request ", request);
    const record = JSON.parse(request.event.body);

    if (!record) {
      return { statusCode: 400, body: "No JSON data provided" };
    }
    console.log("Inside saveUserFeedback userFeedback ", record.userfeedback);

    const paperid = record.pid;
    const userFeedback = record.userfeedback;
    const userRating = record.userrating;
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    const existingUserProfile = await getUserProfileData(userid);
    console.log("existingUserProfile -->> ", existingUserProfile);
    userFirstName = existingUserProfile.firstname;
    userLastName = existingUserProfile.lastname;
    userFullName = userFirstName + " " + userLastName;
    console.log("userFullName -->> ", userFullName);
    console.log("userFirstName -->> ", userFirstName);
    console.log("userLastName -->> ", userLastName);

    // Save userFeedback in a file in S3 with file name as paper id. Check if the file exists then append user comment else create a new file and append user comment. Save the rating also along with the comments. structure the data in such a way that it is easier to retrieve and display on UI when required
    // Check if the file exists in S3
    const params = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`, // Use the key format used during upload
    };

    let existingData = [];
    let fileExists = false;
    try {
      const data = await s3.getObject(params).promise();
      existingData = JSON.parse(data.Body.toString("utf-8"));
      console.log("existingData -->> ", existingData);
      fileExists = true;
    } catch (error) {
      // If the file doesn't exist, proceed with an empty array
      if (error.code !== "NoSuchKey") {
        console.error("Error getting existing file:", error);
        return { statusCode: 500, body: "Error getting existing file" };
      }
    }

    const currentdate = new Date().toISOString();
    const feedbackObject = {
      currentdate,
      userid,
      userFullName,
      userRating,
      userFeedback,
    };

    // Check if the user has submitted feedback earlier
    const existingFeedbackIndex = existingData.findIndex(
      (feedback) => feedback.userid === userid
    );
    if (existingFeedbackIndex !== -1) {
      // Overwrite the existing feedback
      existingData[existingFeedbackIndex] = feedbackObject;
    } else {
      // Append new feedback if no existing feedback found
      existingData.push(feedbackObject);
    }

    // Calculate overall rating and number of responses
    const numResponses = existingData.length;
    const overallRating =
      existingData.reduce((total, feedback) => total + feedback.userRating, 0) /
      numResponses;

    // Save updated data to S3
    const updatedParams = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`, // Use the key format used during upload
      Body: JSON.stringify(existingData),
      ContentType: "application/json",
    };

    if (fileExists) {
      // Update the existing file
      await s3.putObject(updatedParams).promise();
    } else {
      // Create a new file
      await s3.upload(updatedParams).promise();
    }

    // Update overall rating in submittedpapers/sp.txt file
    let paperData = [];
    try {
      const spParams = {
        Bucket: assetBucket,
        Key: `submittedpapers/sp.txt.gz`,
      };
      const data = await s3.getObject(spParams).promise();
      paperData = unzipData(data.Body.toString());
      paperData = JSON.parse(paperData);
      console.log("paperData before updating rating is -->> ", paperData);
    } catch (error) {
      console.error("Error getting submittedpapers/sp.txt.gz:", error);
      return { statusCode: 500, body: "Error getting submitted papers file" };
    }

    const paperIndex = paperData.findIndex((paper) => paper.pid === paperid);
    if (paperIndex !== -1) {
      // Update the paper's rating
      paperData[paperIndex].rating = overallRating;
      paperData[paperIndex].noofreviews = numResponses;
      console.log("paperData after updating rating is -->> ", paperData);
      const updatedSpParams = {
        Bucket: assetBucket,
        Key: `submittedpapers/sp.txt.gz`,
        Body: zipData(JSON.stringify(paperData)),
        ContentType: "application/json",
      };
      await s3.putObject(updatedSpParams).promise();
    }
    return { statusCode: 200, body: "Feedback saved successfully" };
  } catch (err) {
    console.log("Error saving feedback:", err);
    return { statusCode: 500, body: "Error saving feedback" };
  }
};