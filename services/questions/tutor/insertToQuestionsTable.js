
import { ulid } from "ulid";
import { assetBucket, TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
// Setup S3 Client
const s3 = AWSClients.s3();

// Creates a new question for a Exam
export const insertToQuestionsTable = async (record, userid) => {
  try {
    const timestamp = Date.now();
    const nextQuestionId = ulid(timestamp);
    console.log("nextQuestionId -->> ", nextQuestionId);

    const currentdate = new Date().toISOString();

    // Parse marks and negativeMarks as numbers
    const marks = parseFloat(record.marks);
    const negMarks = parseFloat(record.negativeMarks || 0); // If negativeMarks is not provided, set it to 0

    // Upload image to S3 if it exists
    let s3ImagePath = '';
    let hasImage = false;
    if (record.image) {
      hasImage = true;

//      console.log("insertToQuestionsTable record.image -->> ", record.image);
      const jsonString = JSON.stringify(record.image, null, 2); // Convert JSON object to string
//      console.log("insertToQuestionsTable jsonString -->> ", jsonString);
      const imageBuffer = Buffer.from(jsonString, 'utf-8'); // Create a buffer for the text file
//      console.log("insertToQuestionsTable imageBuffer -->> ", imageBuffer);

//      const imageBuffer = Buffer.from(record.image, 'base64');
      const s3Params = {
        Bucket: assetBucket,
        Key: `questionsimages/${record.paperid}/${nextQuestionId}.jpg`, // Use a unique key for each image. Include paperid in the file name
        Body: imageBuffer,
        ACL: "private", // Set appropriate permissions to restrict access to the uploaded image
        ContentEncoding: 'base64', // Required if the image is base64 encoded
        ContentType: 'image/jpeg', // Adjust based on your image type
      };

      const s3UploadResult = await s3.upload(s3Params).promise();
      s3ImagePath = s3UploadResult.Location;
    }

    const params = {
      TableName: TABLE_NAMES.paperQuestionsTable,
      Item: {
        userid: userid,
        qid: nextQuestionId,
        paperid: record.paperid,
        qt: record.question,
        a: record.answer,
        o1: record.option1 ?? "",
        o2: record.option2 ?? "",
        o3: record.option3 ?? "",
        o4: record.option4 ?? "",
        o5: record.option5 ?? "",
        qe: record.answerExplanation,
        examsection: record.section,
        qmarks: marks,
        negmarks: negMarks,
        crtdt: currentdate,
        hasImage: hasImage,
        qimgpath: s3ImagePath, // Store the S3 path in the table
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB insertToQuestionsTable Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Data inserted successfully." };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};