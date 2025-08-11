import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Deletes a question
export const deleteQuestion = async (request, response) => {
  const params = {
    TableName: TABLE_NAMES.paperQuestionsTable,
    Key: {
      questionId: request.pathVariables.questionId,
      questionText: `Question#${request.pathVariables.questionid}`,
    },
  };
  await dynamoDBExam.delete(params).promise();
  return response.output({}, 200);
};