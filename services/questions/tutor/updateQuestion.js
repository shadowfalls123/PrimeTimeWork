
import { assetBucket, TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
// Setup S3 Client
const s3 = AWSClients.s3();

// Update a question for an Exam
export const updateQuestion = async (request, response) => {
  console.log("Inside updateQuestion request ", request);
  const updatedRecord = JSON.parse(request.event.body);
  console.log("Inside updateQuestion updatedRecord ", updatedRecord);

  if (!updatedRecord || !updatedRecord.pid || !updatedRecord.quesid) {
    return {
      statusCode: 400,
      body: "Incomplete data provided for updating the question",
    };
  }

  const currentdate = new Date().toISOString();

    let hasImage = false;
  let s3ImagePath = null;

  if (updatedRecord.image) {
    hasImage = true;
    const jsonString = JSON.stringify(updatedRecord.image, null, 2); // Convert JSON object to string
    const imageBuffer = Buffer.from(jsonString, 'utf-8'); // Create a buffer for the text file

    const s3Params = {
      Bucket: assetBucket,
      Key: `questionsimages/${updatedRecord.pid}/${updatedRecord.quesid}.jpg`, // Use a unique key for each image, include paperid and quesid in the file name
      Body: imageBuffer,
      ACL: "private", // Set appropriate permissions to restrict access to the uploaded image
      ContentEncoding: 'base64', // Required if the image is base64 encoded
      ContentType: 'image/jpeg', // Adjust based on your image type
    };

    try {
      const s3UploadResult = await s3.upload(s3Params).promise();
      s3ImagePath = s3UploadResult.Location;
    } catch (err) {
      console.error("Error uploading image to S3:", err);
      return { statusCode: 500, body: "Error uploading image to S3" };
    }
  }
  
  const params = {
    TableName: TABLE_NAMES.paperQuestionsTable, // Replace 'YourTableName' with your actual table name
    Key: {
      paperid: updatedRecord.pid,
      qid: updatedRecord.quesid,
    },
    UpdateExpression:
      "SET qt = :qt, o1 = :o1, o2 = :o2, o3 = :o3, o4 = :o4, o5 = :o5, a = :a, qe = :qe, examsection = :examsection, qmarks = :qmarks, negmarks = :negmarks, hasImage = :hasImage",
    ExpressionAttributeValues: {
      // ":paperid": updatedRecord.pid,
      // ":qid": updatedRecord.quesid,
      ":qt": updatedRecord.question,
      ":o1": updatedRecord.option1 ?? "",
      ":o2": updatedRecord.option2 ?? "",
      ":o3": updatedRecord.option3 ?? "",
      ":o4": updatedRecord.option4 ?? "",
      ":o5": updatedRecord.option5 ?? "",
      ":a": updatedRecord.answer,
      ":qe": updatedRecord.answerExplanation,
      ":examsection": updatedRecord.selectedSection,
      ":qmarks": updatedRecord.marks,
      ":negmarks": updatedRecord.negativeMarks,
      ":hasImage": hasImage,
      //      "crtdt": currentdate,
      // "customcol1": "",
      // "customcol2": "",
      // "customcol3": "",
      // "customcol4": "",
      // "customcol5": "",
    },
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  try {
    console.log("dynamoDB updateQuestion Params -> ", params);
    const result = await dynamoDBExam.update(params).promise();
    console.log("[updateQuestion] UpdateItem succeeded:", JSON.stringify(result));
    return { statusCode: 200, body: "Question updated successfully." };
  } catch (err) {
    console.error("Unable to update item. Error:", err);
    return {
      statusCode: 500,
      body: "Error updating the question in the Database",
    };
  }
};