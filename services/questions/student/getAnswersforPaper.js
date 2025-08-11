import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Get all questions for a Exam for a paperid
export const getAnswersforPaper = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getAnswersforPaper 1.0 -> paperid -->> ", paperid);
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
      "paperid, qid, a, o1, o2, o3, o4, o5, qt, examsection, qmarks, negmarks",
    //    Limit: count
    //    IndexName: `${tableNamePrefix}_GSI1`,
  };
  console.log("params in getAnswersforPaper 3.0 -> ", params);
  const results = await dynamoDBExam.query(params).promise();
  return results.Items;
};
