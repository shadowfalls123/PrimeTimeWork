import { assetBucket, TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { fetchAndReplaceImages } from "./fetchAndReplaceImages";
import { getUserProfileData } from "../common_functions/getUserProfileData";
import { zipData, unzipData } from "../utils/zipUnzip";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
// Setup S3 Client
const s3 = AWSClients.s3();

// Publish Exam
export const publishExam = async (request, response) => {
  console.log("Inside updateQuestion request ", request);
  const publishExamData = JSON.parse(request.event.body);
  console.log("Inside updateQuestion publishExamData ", publishExamData);

  if (
    !publishExamData ||
    !publishExamData.paper ||
    !publishExamData.questionsData
  ) {
    console.log("Incomplete data provided for publishing the exam");
    return {
      statusCode: 400,
      body: "Incomplete data provided for publishing the exam",
    };
  }

  const paper = publishExamData.paper;
  //  const questionsData = publishExamData.questionsData;
  let questionsData = publishExamData.questionsData;
  //  const currentdate = new Date().toISOString();

  // Group questions by section
  const sectionMap = new Map();
  for (const question of questionsData) {
    const section = question.section || "Default Section"; // Handle empty section names
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section).push(question);
  }

  // Flatten grouped questions back into an array
  questionsData = Array.from(sectionMap.values()).flat();

  console.log("Grouped questionsData:", questionsData);

  //Get user profile details for the paper as add it to the paper data.
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);

    const existingUserProfile = await getUserProfileData(userid);
    console.log("existingUserProfile is -->> ", existingUserProfile);
    if (
      existingUserProfile &&
      existingUserProfile.firstname &&
      existingUserProfile.useremail
    ) {
      // If user profile exists, add the user fname and lname in the paper data
      paper.firstname = existingUserProfile.firstname;
      paper.lastname = existingUserProfile.lastname;
      console.log(
        "User profile data is updated. paper with user detail -->> .",
        paper
      );
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile data is not updated. Cannot publish paper.");
      return {
        statusCode: 200,
        body: "User profile data is not updated. Cannot publish paper. Please update Profile",
      };
    }
  } catch (err) {
    console.log("Error fetching user profile data:", err);
    return { statusCode: 500, body: "Error fetching user profile data" };
  }

  // Fetch and replace images in questionsData
  const updatedQuestionsData = await fetchAndReplaceImages(
    paper.pid,
    questionsData
  );

  // Creating a new file for exam with the file names as paperid
  const examQuestionsparams = {
    Bucket: assetBucket,
    Key: `examquestions/${paper.pid}`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedQuestionsData)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  try {
    await s3.upload(examQuestionsparams).promise();
  } catch (err) {
    console.error("Error updating exam questions data:", err);
    return { statusCode: 500, body: "Error updating exam questions data" };
  }

  const publishExamparams = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`, // Use the key format used during upload
  };

  // Retrieve existing papers data from S3
  let existingData = "";
  let fileExists = false;
  try {
    const data = await s3.getObject(publishExamparams).promise();
    console.log("Raw Data as retrieved from S3", data);
    existingData = unzipData(data.Body.toString()); // Unzip the data
    console.log("Existing Data:", existingData);
    fileExists = true;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code !== "NoSuchKey") {
      console.error("Error getting existing file:", error);
      return { statusCode: 500, body: "Error getting papers file" };
    }
  }

  // Check if the paper with the same paper id exists. This will retun the index on which the paper is found else will retun -1 if paper is not found
  const existingPaperIndex = existingData
    ? JSON.parse(existingData).findIndex(
        (existingPaper) => existingPaper.pid === paper.pid
      )
    : -1;

  console.log("Existing Paper Index:", existingPaperIndex);

  // Append new exam data to existing data or create a new array if no data exists
  let updatedExamArray = [];

  //if index is not equal to -1 than we have found paper in the file and index number will be on which the paper is found else we append a new paper in file
  if (existingPaperIndex !== -1) {
    // Replace the existing paper
    updatedExamArray = JSON.parse(existingData);
    console.log("Existing Data:", existingData);

    // If paper exist than we want to retain the existing rating as save user feedback updated the rating in sp.txt file. we do not want to loose the old updated rating for that paper
    const existingRating = updatedExamArray[existingPaperIndex].rating;
    paper.rating = existingRating !== undefined ? existingRating : paper.rating;

    const existingNoOfReviews =
      updatedExamArray[existingPaperIndex].noofreviews;
    paper.noofreviews =
      existingNoOfReviews !== undefined
        ? existingNoOfReviews
        : paper.noofreviews;

    updatedExamArray[existingPaperIndex] = paper;
    console.log("Updated Data:", updatedExamArray);
  } else {
    // Append the new paper
    updatedExamArray = existingData ? JSON.parse(existingData) : [];
    console.log("Existing Data:", existingData);

    updatedExamArray.push(paper);
    console.log("Updated Data:", updatedExamArray);
    console.log(
      "JSON.stringify(updatedExamArray) -->> ",
      JSON.stringify(updatedExamArray)
    );
  }

  // Save updated data to S3
  const updatedPublishExamparams = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedExamArray)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  console.log("Updated Publish Exam Params:", updatedPublishExamparams);

  // Update or create the file in S3
  try {
    await s3.upload(updatedPublishExamparams).promise();
  } catch (error) {
    console.error("Error updating or creating the file:", error);
    return { statusCode: 500, body: "Error updating or creating the file" };
  }

  // Update DynamoDB item with published status
  const params = {
    TableName: TABLE_NAMES.submittedPapersTable,
    Key: {
      userid: request.event.requestContext.authorizer.jwt.claims.username,
      paperid: paper.pid,
    },
    UpdateExpression: "SET published = :published",
    ExpressionAttributeValues: {
      ":published": 1,
    },
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  // Execute DynamoDB update
  try {
    console.log("update published status DB Params -> ", params);
    const result = await dynamoDBExam.update(params).promise();
    console.log("Exam Published Successfully:", JSON.stringify(result));
    return { statusCode: 200, body: "Exam Published Successfully." };
  } catch (err) {
    console.error("Unable to update published status. Error:", err);
    return {
      statusCode: 500,
      body: "Error updating published status",
    };
  }
};
