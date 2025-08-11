import { insertToQuestionsTable } from "./insertToQuestionsTable";

// Uploading all the questions from a file
export const uploadQuestionsFile = async (request, response) => {
    console.log("Inside uploadQuestionsFile request ", request);
    const records = JSON.parse(request.event.body);
    if (!records) {
      console.log("Inside uploadQuestionsFile 1.3 ");
      return { statusCode: 400, body: "No JSON data provided" };
    }
    for (const record of records.data.uploadData) {
      if (
        !record.hasOwnProperty("question") ||
        // !record.hasOwnProperty("option1") ||
        // !record.hasOwnProperty("option2") ||
        // !record.hasOwnProperty("option3") ||
        // !record.hasOwnProperty("option4") ||
        // !record.hasOwnProperty("option5") ||
        !record.hasOwnProperty("answer") ||
        !record.hasOwnProperty("section") || // Ensure "section" field exists
        !record.hasOwnProperty("marks") || // Ensure "marks" field exists
        !record.hasOwnProperty("negativeMarks") || // Ensure "negativeMarks" field exists
        isNaN(record.marks) || // Ensure "marks" field is a number
        isNaN(record.negativeMarks) // Ensure "negativeMarks" field is a number
      ) {
        console.log(
          "Skipping record as it does not have all required fields:",
          JSON.stringify(record)
        );
        continue;
      }
      try {
        console.log(`In uploadQuestionsFile  1 record -> `, record);
        // let recordData = {"event": {"body":JSON.stringify(record)}};
        // console.log(`In uploadQuestionsFile  2 - recordData -> `, recordData);
        //  const results = await addQuestion(record);
        const results = await insertToQuestionsTable(
          record,
          request.event.requestContext.authorizer.jwt.claims.username
        );
        //      const results = await dynamoDBExam.put(params).promise();
      } catch (err) {
        console.log("Error inserting JSON data into Database:", err);
        return {
          statusCode: 500,
          body: "Error inserting JSON data into Database",
        };
      }
    }
    return { statusCode: 200, body: "Data uploaded successfully" };
  };