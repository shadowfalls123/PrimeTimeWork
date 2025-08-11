import { verifyUserPurchase } from "../common_functions/verifyUserPurchase";
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";
import { unzipData } from "../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

// Get all questions for a Exam for a paperid
export const getExamQuestions = async (request, response) => {
    console.log("Request in getExamQuestions 1.0 -> ", request);
    console.log(
      "In getExamQuestions 2.0 -> request.pathVariables.paperid -->> ",
      request.pathVariables.paperid
    );
    console.log(
      "In getExamQuestions 2.0 -> request.pathVariables.packid -->> ",
      request.pathVariables.packid
    );
    const paperid = request.pathVariables.paperid;
    const packid = request.pathVariables.packid;
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    // const examInstructions = await getExamInstructions(paperid);
    //  const purchaseVerified = await verifyUserPurchase(userid, paperid);
    const purchaseVerified = await verifyUserPurchase(userid, packid, paperid);
    console.log("purchaseVerified -> ", purchaseVerified);
    if (purchaseVerified) {
      try {
        //    const results = await getExamQuestionsChildFromDB(paperid); //Use this to retrieve the details from database
        const examQuestions = await getExamQuestionsChildFromS3(paperid); //Use this to retrieve examData from S3
        return examQuestions;
      } catch (error) {
        console.error("Error Code - ERF001", error);
        return { statusCode: 500, body: "Error Code - ERF001" };
      }
      // return results;
    } else {
      return { statusCode: 200, body: "Not authorized - Paper not purchased, " };
    }
  };


  // Get all questions for a Exam for a paperid from S3
  const getExamQuestionsChildFromS3 = async (paperid) => {
    // console.log("Request in getExamQuestions 1.0 -> ", request);
    console.log("In getExamQuestionsChildFromS3 1.0 -> paperid -->> ", paperid);
    // const paperid = request.pathVariables.paperid;
  
    // const examInstructions = await getExamInstructions(paperid);
  
    // Creating a new file for exam with the file names as paperid
    const examQuestionsparams = {
      Bucket: assetBucket,
      Key: `examquestions/${paperid}`,
    };
  
    try {
      const data = await s3.getObject(examQuestionsparams).promise();
      console.log("Raw Data as retrieved from S3", data);
      examData = unzipData(data.Body.toString()); // Unzip the data
      console.log("Existing Data:", examData);
  
      // Transform the data to exclude the "ans" and "explanation" property from each question
      const transformedData = JSON.parse(examData).map(
        ({ ans, explanation, ...rest }) => rest
      );
  
      return transformedData;
    } catch (error) {
      // If the file doesn't exist, proceed with an empty string
      if (error.code === "NoSuchKey") {
        console.error("Error getting existing file:", error);
        return [];
        //        return { statusCode: 500, body: "Error getting papers file" };
      } else {
        throw error; // Rethrow other errors for further handling
      }
    }
  
    //  return results.Items;
  };