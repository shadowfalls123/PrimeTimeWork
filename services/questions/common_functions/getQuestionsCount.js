import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Get Count of questions for a paper
export const getQuestionsCount = async (request, response) => {
  const params = {
    TableName: TABLE_NAMES.paperQuestionsTable,
    IndexName: `${tableNamePrefix}_GSI1`,
    KeyConditionExpression: "paperid = :paperid",
    ExpressionAttributeValues: {
      ":paperid": request.pathVariables.pid,
    },
    Select: "COUNT",
  };

  try {
    console.log("getQuestionsCount Params -> ", params);
    const result = await dynamoDBExam.query(params).promise();

    // Check if result.Count exists and return it, otherwise return 0
    const count = result.Count !== undefined ? result.Count : 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ count }), // Return the count in the response body
    };
  } catch (err) {
    console.error(
      "getQuestionsCount - Error getting count of questions for paper",
      err
    );

    // Return a response indicating an error occurred
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error getting count of questions for paper",
      }),
    };
  }
};