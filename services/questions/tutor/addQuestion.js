import { insertToQuestionsTable } from "./insertToQuestionsTable";

// Creates a new question for a Exam - one by one
export const addQuestion = async (request, response) => {
    console.log("Inside addQuestion request 1.0 ");
    console.log("Inside addQuestion request ", request);
    const record = JSON.parse(request.event.body);
    console.log("Inside addQuestion record ", record);
  
    if (!record) {
      return { statusCode: 400, body: "No JSON data provided" };
    }
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    const results = await insertToQuestionsTable(record, userid);
    return { statusCode: 200, body: "Data inserted successfully." };
  };