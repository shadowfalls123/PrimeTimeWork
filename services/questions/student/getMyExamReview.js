import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Get all questions for a Exam for a paperid
export const getMyExamReview = async (request, response) => {
  console.log("Request in getMyExamReview 1.0 -> ", request);
  const paperid = request.pathVariables.pid;
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  console.log("In getMyExamReview 1.0 -> paperid -->> ", paperid);

  const params = {
    TableName: TABLE_NAMES.examResultsTable,
    KeyConditionExpression: "userid = :userid AND begins_with(pqid, :paperid)",
    ExpressionAttributeValues: {
      //      ":key": parseInt(request.pathVariables.paperid)
      ":userid": userid,
      ":paperid": paperid,
    },
    ProjectionExpression: "pqid, qid, score, selectedAnswer",
  };
  console.log("params in getMyExamReview 3.0 -> ", params);
  const result = await dynamoDBExam.query(params).promise();
  console.log("result in getMyExamReview 3.0 -> ", result);

  if (result.Items && result.Items.length > 0) {
    // Obfuscate column names before sending to frontend
    const obfuscatedExamResults = result.Items.map((item) =>
      obfuscateColumnsRestultsTabGMER(item)
    );
    console.log(
      "Obfuscated results in getMyExamReview -> ",
      obfuscatedExamResults
    );

    // Query the examResultsHistoryTable
    const historyParams = {
      TableName: TABLE_NAMES.examResultsHistoryTable,
      KeyConditionExpression:
        "userid = :userid AND begins_with(paperid, :paperid)",
      ExpressionAttributeValues: {
        ":userid": userid,
        ":paperid": paperid,
      },
      ProjectionExpression:
        "paperid, examscore, totalquestions, examdate, totposscore, secscores, sectotposscores, secqcount, totunansq, secunansq",
    };
    console.log(
      "params in getMyExamReview for history table -> ",
      historyParams
    );
    const historyResult = await dynamoDBExam.query(historyParams).promise();
    console.log(
      "result in getMyExamReview for history table -> ",
      historyResult
    );

    if (historyResult.Items && historyResult.Items.length > 0) {
      // Obfuscate column names before sending to frontend
      const obfuscatedHistoryTabResults = historyResult.Items.map((item) =>
        obfuscateColumnsRestultsHistoryTabGMER(item)
      );
      console.log(
        "obfuscatedHistoryTabResults in getMyExamReview -> ",
        obfuscatedHistoryTabResults
      );

      // Merge obfuscated data from both tables
      const mergedObfuscatedResults = {
        examResults: obfuscatedExamResults,
        historyResults: obfuscatedHistoryTabResults,
      };

      return mergedObfuscatedResults;
    }
  } else {
    return []; // Return an empty array when no records are found
  }
};


const obfuscateColumnsRestultsTabGMER = (data) => {
    const obfuscatedKeys = {
      qid: "quesid",
      pqid: "paperquesid",
      score: "score",
      selectedAnswer: "selectedAns",
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
  
  const obfuscateColumnsRestultsHistoryTabGMER = (data) => {
    const obfuscatedKeys = {
      paperid: "pid",
      examscore: "examScore",
      totalquestions: "totalQuestions",
      examdate: "examdate",
      totposscore: "totalPossibleScore",
      secscores: "sectionWiseScores",
      sectotposscores: "sectionWiseTotalPossibleScores",
      secqcount: "sectionWiseQuestionCount",
      totunansq: "totalUnansweredQuestions",
      secunansq: "sectionWiseUnansweredQuestions",
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