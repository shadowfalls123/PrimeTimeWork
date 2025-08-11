import { getExamQuestionsChildForTutorFromS3 } from "../tutor/getExamQuestionsChildForTutorFromS3";
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { verifyUserPurchase } from "../common_functions/verifyUserPurchase";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Verfiy if the user has purchased the exam, if paperid exists in myCoursesTable then send true else false
const verifyPaperOwnership = async (userid, paperid) => {
  try {
    console.log("In verifyPaperOwnership 1.0 -> paperid -->> ", paperid);
    console.log("In verifyPaperOwnership 1.0 -> userid -->> ", userid);
    const params = {
      TableName: TABLE_NAMES.submittedPapersTable,
      KeyConditionExpression: "userid = :userid AND paperid = :paperid",
      ExpressionAttributeValues: {
        ":userid": userid,
        ":paperid": paperid,
      },
      //     FilterExpression: "paperid = :paperid",
      ProjectionExpression: "paperid",
    };

    console.log("params in verifyPaperOwnership 2.0 -> ", params);
    const results = await dynamoDBExam.query(params).promise();

    // If the result contains items, then the user has purchased the exam
    if (results.Items.length > 0) {
      return true;
    } else {
      return false;
    }
    //    return results.Items.length > 0;
  } catch (error) {
    console.error("Error verifying user ownership:", error);
    throw error;
  }
};

// Get all questions for a Exam for a paperid
export const getSPQuestions = async (request, response) => {
  console.log("Request in getSPQuestions 1.0 -> ", request);
  console.log(
    "In getSPQuestions 2.0 -> request.pathVariables.paperid -->> ",
    request.pathVariables.pid
  );
  const paperid = request.pathVariables.pid;
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  // const examInstructions = await getExamInstructions(paperid);
  const paperOwnershipVerified = await verifyPaperOwnership(userid, paperid);
  console.log("paperOwnershipVerified -> ", paperOwnershipVerified);
  if (paperOwnershipVerified) {
    const results = await getExamQuestionsChildForTutorFromDB(paperid); //use this to get the data from Database
    //    const results = await getExamQuestionsChildForTutorFromS3(paperid); //use this to get the data from S3
    return results;
  } else {
    return {
      statusCode: 200,
      body: "Not authorized - user is not autorized, ",
    };
  }
};

// Get all questions for a Exam for a paperid
export const getSPQuestionsReviewAnswers = async (request, response) => {
  console.log("Request in getSPQuestionsReviewAnswers 1.0 -> ", request);
  console.log(
    "In getSPQuestionsReviewAnswers 2.0 -> request.pathVariables.paperid -->> ",
    request.pathVariables.pid
  );
  const paperid = request.pathVariables.pid;
  const packid = request.pathVariables.packid;
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  // const examInstructions = await getExamInstructions(paperid);
  const purchaseVerified = await verifyUserPurchase(userid, packid, paperid);
  console.log("purchaseVerified -> ", purchaseVerified);
  if (purchaseVerified) {
    //    const results = await getExamQuestionsChildForTutorFromDB(paperid); //use this to get the data from Database
    const results = await getExamQuestionsChildForTutorFromS3(paperid); //use this to get the data from S3
    return results;
  } else {
    return {
      statusCode: 200,
      body: "Not authorized - user is not autorized, ",
    };
  }
};

// Get all questions for a Exam for a paperid
const getExamQuestionsChildForTutorFromDB = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestionsChildForTutor 1.0 -> paperid -->> ", paperid);
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const params = {
    TableName: TABLE_NAMES.paperQuestionsTable,
    KeyConditionExpression: "paperid = :key",
    ExpressionAttributeValues: {
      //      ":key": parseInt(request.pathVariables.paperid)
      ":key": paperid,
    },
    ProjectionExpression:
      "paperid, qid, a, o1, o2, o3, o4, o5, qt, qe, qmarks, examsection, negmarks, qimgpath, hasImage",
    //    Limit: count
    //    IndexName: `${tableNamePrefix}_GSI1`,
  };
  console.log("params in getExamQuestions 3.0 -> ", params);
  const results = await dynamoDBExam.query(params).promise();
  if (results.Items && results.Items.length > 0) {
    // Obfuscate column names before sending to frontend
    const obfuscatedResults = results.Items.map((item) =>
      obfuscateColumnNamesGEQCT(item)
    );

    return obfuscatedResults;
  } else {
    console.log("No questions found for paperid ", paperid);
    return [];
  }
  //  return results.Items;
};

const obfuscateColumnNamesGEQCT = (data) => {
  const obfuscatedKeys = {
    paperid: "pid",
    qid: "quesid",
    a: "ans",
    o1: "op1",
    o2: "op2",
    o3: "op3",
    o4: "op4",
    o5: "op5",
    qt: "qtxt",
    qe: "explanation",
    qmarks: "marks",
    examsection: "section",
    negmarks: "negativeMarks",
    // Add more mappings as needed for other columns
  };
  const transformedData = {};
  Object.keys(data).forEach((key) => {
    if (obfuscatedKeys[key]) {
      transformedData[obfuscatedKeys[key]] = data[key];
    } else {
      transformedData[key] = data[key];
    }
  });
  return transformedData;
};