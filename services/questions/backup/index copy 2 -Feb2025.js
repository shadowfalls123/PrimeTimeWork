/*
  Questions Service:
  This Lambda function handles all interactions for questions in the exam
  management system application (create, delete, get).
*/
import {
  createRouter,
  RouterType,
  Matcher,
  validatePathVariables,
  validateBodyJSONVariables,
  validateMultipartFormData,
  parseMultipartFormData,
  enforceGroupMembership,
} from "lambda-micro";
import { ulid } from "ulid";
import { AWSClients, generateID } from "../common_functions";
import Razorpay from "razorpay";
// import OpenAI from "openai";
import fetch from "node-fetch";


const { htmlToText } = require('html-to-text');
const zlib = require("zlib");
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
// const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup S3 Client
const s3 = AWSClients.s3();

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
//const dynamoDBHLExam = AWSClients.dynamoDBHL();
const dynamoDBPQL = AWSClients.dynamoDBPQL();
const cognitoISP = AWSClients.cisp();

//const { marshall, unmarshall } = dynamoDBExam.Converter;

// Determine the environment type (you might fetch this from NODE_ENV or another environment variable)
const environmentType = process.env.NODE_ENV?.trim(); // Fetch your environment type here
console.log(`Environment Type: ${environmentType}`);
// Define table name prefix based on the environmentType
let tableNamePrefix = "";
if (environmentType === "production") {
  tableNamePrefix = "prod";
} else if (environmentType === "development") {
  tableNamePrefix = "dev";
} else if (environmentType === "uat") {
  tableNamePrefix = "uat";
} else {
  tableNamePrefix = "unknown";
}

const paperQuestionsTable = process.env.DYNAMO_DB_PAPERQUESTIONS_TABLE;
const packageTable = process.env.DYNAMO_DB_PACKAGE_TABLE;
const submittedPapersTable = process.env.DYNAMO_DB_SUBMITTEDPAPERS_TABLE;
const myCoursesTable = process.env.DYNAMO_DB_MYCOURSES_TABLE;
const examResultsTable = process.env.DYNAMO_DB_EXAMRESULTS_TABLE;
const examResultsHistoryTable = process.env.DYNAMO_DB_EXAMRESULTSHISTORY_TABLE;
const topRatedPapers = process.env.DYNAMO_DB_TOPRATEDPAPERS_TABLE;
const userProfileTable = process.env.DYNAMO_DB_USERPROFILE_TABLE;
const userCreditsTable = process.env.DYNAMO_DB_USERCREDITS_TABLE;
const paymentHistoryTable = process.env.DYNAMO_DB_PAYMENTHISTORY_TABLE;
const userPoolID = process.env.USER_POOL_ID;
const assetBucket = process.env.ASSET_BUCKET;
const razorPayKeyId = process.env.RAZORPAY_KEY_ID;
const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const phonepeUrl = process.env.PHONEPE_URL;
const phonepeMerchantId = process.env.PHONEPE_MERCHANT_ID;
const phonepeMerchantUserId = process.env.PHONEPE_MERCHANT_USER_ID;
const phonepeKeySecret = process.env.PHONEPE_KEY_SECRET;
const phonepeKeyIndex = process.env.PHONEPE_KEYINDEX;
const openAPIKeyId = process.env.OPEN_API_KEY_ID;
const openAPIKeySecret = process.env.OPEN_API_KEY_SECRET;


if (!razorPayKeyId || !razorPayKeySecret || !openAPIKeyId || !openAPIKeySecret) {
  console.warn("One or more critical environment variables are missing!");
}

if (razorPayKeyId && razorPayKeySecret && openAPIKeyId && openAPIKeySecret) {
  console.warn("All keys and secrets are present!");
}

// // Configure OpenAI API
// const openai = new OpenAI({
//   apiKey: openAPIKeySecret
// });

const razorpay = new Razorpay({
  key_id: razorPayKeyId, // Replace with your Razorpay Key ID
  key_secret: razorPayKeySecret, // Replace with your Razorpay Secret Key
});

// This JSON schema defines an object with the following properties:
// files: An array of objects, each of which represents a file. The array must contain at least one file, and at most one file.
// fields: An object with additional fields.
// The fileDefinition type, which represents a file, has the following properties:
// content: An object representing the content of the file.
// fileName: A string representing the name of the file. The string must have a minimum length of 1.
// contentType: A string representing the content type of the file. The only accepted value is "application/pdf".
// encoding: A string representing the encoding of the file. The string must have a minimum length of 1.
// fieldName: A string representing the field name of the file. The string must have a minimum length of 1.
// The fieldsDefinition type, which represents additional fields, has the following properties:
// tags: A string representing tags.
// name: A string representing the name of the field. The string must have a minimum length of 1.
// All properties in the schema are defined with type, and both files and fields have specific required properties that must be present. The additionalProperties property is set to false, which means that no additional properties are allowed in the JSON object that conforms to this schema.
// These are JSON schemas that are used to validate requests to the service
const schemas = {
  addQuestion: require("./schemas/createQuestion.json"),
  deleteQuestion: require("./schemas/deleteQuestion.json"),
  getQuestion: require("./schemas/getQuestion.json"),
  uploadQuestionsFile: require("./schemas/uploadCSV.json"),
  uploadJSON: require("./schemas/uploadJSON.json"),
};

//------------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------------

// Auth middleware for lambda-micro
const requireLoggedInUser = (handler) => async (req, res) => {
  const userid = req.event.requestContext.authorizer.jwt.claims.username;
  if (userid) {
    return await handler(req, res); // Allow access to the actual handler
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

const anonymizeKeys = (data) => {
  // Map database column names to anonymized keys
  const anonymizedKeys = {
    paperid: "pid",
    atime: "examtime",
    examdesc: "paperdesc",
    examtitle: "papertitle",
    numofq: "qcount",
    paperrating: "rating",
    examtakenflag: "examtaken",
    reviewcount: "noofreviews",
    // Add more mappings as needed for other columns
  };

  const transformedData = {};
  Object.keys(data).forEach((key) => {
    if (anonymizedKeys[key]) {
      transformedData[anonymizedKeys[key]] = data[key];
    } else {
      transformedData[key] = data[key];
    }
  });
  return transformedData;
};

const extractValues = (item) => {
  const extractedItem = {};
  Object.keys(item).forEach((key) => {
    const attributeType = Object.keys(item[key])[0];
    extractedItem[key] = item[key][attributeType];
  });
  return extractedItem;
};

const uploadFileToS3 = async (id, formFile) => {
  const params = {
    Bucket: process.env.UPLOAD_BUCKET,
    Key: `${id}.csv`,
    Body: formFile.content,
    ContentType: formFile.contentType,
  };
  return s3.upload(params).promise();
};

function validateRequestBody(schema) {
  return (req, res, next) => {
    const result = schema.validate(req.body);
    if (result.error) {
      res.status(400).send(result.error.details[0].message);
    } else {
      next();
    }
  };
}

// Function to zip data
const zipData = (data) =>
  zlib.deflateSync(Buffer.from(data)).toString("base64");

// Function to unzip data
const unzipData = (data) =>
  zlib.inflateSync(Buffer.from(data, "base64")).toString();

// // Function to compress data
// const zipData = (data) => zlib.deflateSync(Buffer.from(data));

// // Function to decompress data
// const unzipData = (data) => zlib.inflateSync(Buffer.from(data)).toString();

//------------------------------------------------------------------------
// SERVICE FUNCTIONS
//------------------------------------------------------------------------

//******************* Functions for Tutor -->> Start ****************************************************************************/
const createPackage = async (request, response) => {
  console.log("Inside createPackage request 1.0 ");
  console.log("Inside createPackage request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const timestamp = Date.now();
    const nextPackageId = ulid(timestamp);
    console.log("nextPackageId -->> ", nextPackageId);
    const packRating = 0; // Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const currentdate = new Date().toISOString();

    const params = {
      TableName: packageTable,
      Item: {
        userid: userid,
        packageid: nextPackageId,
        packagerating: packRating,
        packagetitle: record.packTitle,
        packagedesc: record.packDesc,
        numofp: record.numOfPapers,
        packageprice: record.packPrice,
        packagepapers: record.selectedPapers,
        reviewcount: 0,
        crtdt: currentdate,
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB createPackage Params -> ", params);

    await dynamoDBExam.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(nextPackageId),
    };
  } catch (err) {
    console.log("Error inserting data into Database:", err);
    return { statusCode: 500, body: "Error inserting data into Database" };
  }
};

const publishPack = async (request, response) => {
  console.log("Inside publishPackage request 1.0 ");
  console.log("Inside publishPackage request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const timestamp = Date.now();
    const packRating = 0; // Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const currentdate = new Date().toISOString();

    const s3PackageParams = {
      Bucket: assetBucket,
      Key: `packages/package.txt.gz`, // Use the key format used during upload
    };

    // Retrieve existing papers data from S3
    let existingData = "";
    let fileExists = false;

    try {
      const data = await s3.getObject(s3PackageParams).promise();
      console.log("Raw Data as retrieved from S3", data);
      existingData = unzipData(data.Body.toString()); // Unzip the data
      console.log("Existing Data:", existingData);
      fileExists = true;
    } catch (error) {
      // If the file doesn't exist, proceed with an empty string
      if (error.code !== "NoSuchKey") {
        console.error("Error getting existing file:", error);
        return { statusCode: 500, body: "Error getting papers file" };
      }
    }

    // Update updatedPackageData with userid and nextPackageId
    const updatedPackageData = {
      ...record,
      packrating: packRating,
      userid: userid,
      //      packid: nextPackageId,
      createdate: currentdate,
    };
    console.log("updatedPackageData -->> ", updatedPackageData);
    // Append new package data to existing data or create a new array if no data exists
    let updatedPackageArray = [];

    if (existingData) {
      updatedPackageArray = JSON.parse(existingData);
    }

    // Check if the package already exists
    const existingPackageIndex = updatedPackageArray.findIndex(
      (pkg) => pkg.packid === updatedPackageData.packid
    );

    if (existingPackageIndex > -1) {
      // Update existing package
      updatedPackageArray[existingPackageIndex] = updatedPackageData;
    } else {
      // Append new package data
      updatedPackageArray.push(updatedPackageData);
    }

    // Append the new package data
    //    updatedPackageArray.push(updatedPackageData);
    console.log("Updated Data:", updatedPackageArray);
    console.log(
      "JSON.stringify(updatedPackageArray) -->> ",
      JSON.stringify(updatedPackageArray)
    );

    // Save updated data to S3
    const savePackageparams = {
      Bucket: assetBucket,
      Key: `packages/package.txt.gz`, // Use the key format used during upload
      Body: zipData(JSON.stringify(updatedPackageArray)), // Zip the data
      ContentEncoding: "gzip", // Indicate the content encoding for S3
      ContentType: "application/gzip",
    };
    console.log("savePackageparams:", savePackageparams);

    // Update or create the file in S3
    try {
      await s3.upload(savePackageparams).promise();
    } catch (error) {
      console.error("Error creating the package file:", error);
      return { statusCode: 500, body: "Error creating the package file" };
    }
    return { statusCode: 200, body: "Package Published Successfully" };
  } catch (err) {
    console.log("Error inserting data into Database:", err);
    return { statusCode: 500, body: "Error inserting data into Database" };
  }
};

const createExam = async (request, response) => {
  console.log("Inside createExam request 1.0 ");
  console.log("Inside createExam request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const timestamp = Date.now();
    const nextPaperId = ulid(timestamp);
    console.log("nextPaperId -->> ", nextPaperId);
    const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const currentdate = new Date().toISOString();

    const params = {
      TableName: submittedPapersTable,
      Item: {
        userid: userid,
        paperid: nextPaperId,
        paperrating: paperrating,
        examtitle: record.examTitle,
        examdesc: record.examDescription,
        numofq: record.numQuestions,
        atime: record.allocatedTime,
        paperprice: record.examPrice,
        cat: record.selectedCategory,
        subcat: record.selectedSubcategory,
        subcatl2: record.selectedSubcategoryLevel2,
        difflvl: record.selectedDifficultyLevel,
        sections: record.sections, // Add sections from record
        dummycolumn: 1,
        published: 0,
        reviewcount: 0,
        crtdt: currentdate,
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB createExam Params -> ", params);

    await dynamoDBExam.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(nextPaperId),
    };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }

  //  return { statusCode: 200, body: "Exam created successfully" };
};

const updatePack = async (request, response) => {
  console.log("Inside updatePack request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const currentdate = new Date().toISOString();

    const params = {
      TableName: packageTable,
      Key: {
        userid: userid,
        packageid: record.packid, // Assuming packid is used to identify the pack to update
      },
      UpdateExpression: `
        SET packagetitle = :packTitle,
            packagedesc = :packDesc,
            packageprice = :packPrice,
            packagepapers = :selectedPapers,
            updatedate = :updatedate
      `,
      ExpressionAttributeValues: {
        ":packTitle": record.packTitle,
        ":packDesc": record.packDesc,
        ":packPrice": record.packPrice,
        ":selectedPapers": record.selectedPapers,
        ":updatedate": currentdate,
      },
      ReturnValues: "ALL_NEW", // Return the updated item
    };

    console.log("DynamoDB updatePack Params -> ", params);

    const results = await dynamoDBExam.update(params).promise();
    console.log("results is -->> ", results);
    return { statusCode: 200, body: "Data updated successfully." };
  } catch (err) {
    console.log("Error updating pack data in Database:", err);
    return { statusCode: 500, body: "Error updating pack data in Database" };
  }
};

const updateExam = async (request, response) => {
  console.log("Inside updateExam request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const currentdate = new Date().toISOString();

    const params = {
      TableName: submittedPapersTable,
      Key: {
        userid: userid,
        paperid: record.pid, // Assuming pid is used to identify the exam to update
      },
      UpdateExpression: `
        SET examtitle = :examtitle,
            examdesc = :examdesc,
            numofq = :numofq,
            atime = :atime,
            paperprice = :paperprice,
            cat = :cat,
            subcat = :subcat,
            subcatl2 = :subcatl2,
            difflvl = :difflvl,
            updatedt = :updatedt,
            sections = :sections
      `,
      ExpressionAttributeValues: {
        ":examtitle": record.papertitle,
        ":examdesc": record.paperdesc,
        ":numofq": record.qcount,
        ":atime": record.examtime,
        ":paperprice": record.price,
        ":cat": record.category,
        ":subcat": record.subcategory,
        ":subcatl2": record.subcategorylvl2,
        ":difflvl": record.difflvl,
        ":sections": record.sections,
        ":updatedt": currentdate,
      },
      ReturnValues: "ALL_NEW", // Return the updated item
    };

    console.log("DynamoDB updateExam Params -> ", params);

    const results = await dynamoDBExam.update(params).promise();
    console.log("results is -->> ", results);
    return { statusCode: 200, body: "Data updated successfully." };
  } catch (err) {
    console.log("Error updating exam data in Database:", err);
    return { statusCode: 500, body: "Error updating exam data in Database" };
  }
};

// ####### ---- addQuestions functions -->> Start ---- ########

//General module for inserting data in questionsTable
// Creates a new question for a Exam
const insertToQuestionsTable = async (record, userid) => {
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
      TableName: paperQuestionsTable,
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

// Update a question for an Exam using PartiQL
const updateQuestionPartiQL = async (request, response) => {
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

  const params = {
    Statement: `
      UPDATE ExamQuestionsTable 
      SET 
        qt = '${updatedRecord.question}', 
        o1 = '${updatedRecord.option1}', 
        o2 = '${updatedRecord.option2}', 
        o3 = '${updatedRecord.option3}', 
        o4 = '${updatedRecord.option4}', 
        a = '${updatedRecord.answer}', 
        qe = '${updatedRecord.answerExplanation}', 
        crtdt = '${currentdate}',
        customcol1 = "",
        customcol2 = "",
        customcol3 = "",
        customcol4 = "",
        customcol5 = "",
        userid = '${request.event.requestContext.authorizer.jwt.claims.username}
      WHERE 
        paperid = '${updatedRecord.pid}' AND 
        qid = '${updatedRecord.quesid}'
    `,
  };

  try {
    console.log("dynamoDB updateQuestion Params -> ", params);
    const result = await dynamoDBPQL.executeStatement(params).promise();
    console.log("UpdateItem succeeded:", JSON.stringify(result));
    return { statusCode: 200, body: "Question updated successfully." };
  } catch (err) {
    console.error("Unable to update item. Error:", err);
    return {
      statusCode: 500,
      body: "Error updating the question in the Database",
    };
  }
};

// Update a question for an Exam
const updateQuestion = async (request, response) => {
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
    TableName: paperQuestionsTable, // Replace 'YourTableName' with your actual table name
    Key: {
      paperid: updatedRecord.pid,
      qid: updatedRecord.quesid,
    },
    UpdateExpression:
      "SET qt = :qt, o1 = :o1, o2 = :o2, o3 = :o3, o4 = :o4, o5 = :o5, a = :a, qe = :qe, examsection = :examsection, qmarks = :qmarks, negmarks = :negmarks",
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
    console.log("UpdateItem succeeded:", JSON.stringify(result));
    return { statusCode: 200, body: "Question updated successfully." };
  } catch (err) {
    console.error("Unable to update item. Error:", err);
    return {
      statusCode: 500,
      body: "Error updating the question in the Database",
    };
  }
};

const fetchAndReplaceImages = async (paperId, questionsData) => {
  // Step 1: Fetch all objects in the paper folder
  const params = {
    Bucket: assetBucket,
    Prefix: `questionsimages/${paperId}/`
  };

  try {
    const allObjects = await s3.listObjectsV2(params).promise();
    const imageFiles = allObjects.Contents;
    console.log("Fetched image files:", imageFiles);

    // Step 2: Create a mapping of question IDs to base64-encoded image data
    const imageMap = {};
    for (const file of imageFiles) {
      const key = file.Key;
      const questionId = key.split('/').pop().split('.')[0]; // Extract questionId from filename

      // Fetch image data for each file
      const imageData = await s3.getObject({ Bucket: assetBucket, Key: key }).promise();
      const utf8Image = imageData.Body.toString('utf-8');
      const parsedImageData = JSON.parse(utf8Image); // Parse the image JSON structure

      // Map questionId to its images (questionImage, option1Image, etc.)
      imageMap[questionId] = parsedImageData;
    }

    // Step 3: Replace placeholders in questionsData
    const updatedQuestionsData = questionsData.map(question => {
//      const { quesid, qtxt, op1, op2, op3, op4 } = question;
      const { quesid, qtxt, op1, op2, op3, op4, op5, explanation } = question;

      // Replace question image placeholder with Image
      if (imageMap[quesid]?.questionImage && qtxt.includes("{questionImage}")) {
        question.qtxt = qtxt.replace("{questionImage}", `<img src="${imageMap[quesid].questionImage}" />`);
      }

      // Replace Answer Explaination image placeholder with Image
      if (imageMap[quesid]?.ansExpImage && explanation.includes("{ansExpImage}")) {
        question.explanation = explanation.replace("{ansExpImage}", `<img src="${imageMap[quesid].ansExpImage}" />`);
      }

      // Replace option images placeholders
      for (let i = 1; i <= 5; i++) {
        const optionPlaceholder = `{option${i}Image}`;
        const optionKey = `op${i}`;
        const optionImageKey = `option${i}Image`; // Use keys like option1Image, option2Image, etc.

        if (
          question[optionKey] &&
          question[optionKey].includes(optionPlaceholder) &&
          imageMap[quesid]?.[optionImageKey]
        ) {
          question[optionKey] = question[optionKey].replace(optionPlaceholder, `<img src="${imageMap[quesid][optionImageKey]}" />`);
        }
      }

      return question;
    });

    return updatedQuestionsData;
  } catch (error) {
    console.error("Error fetching images or replacing placeholders:", error);
    throw new Error("Failed to fetch images or update questions data");
  }
};

// Publish Exam
const publishExam = async (request, response) => {
  console.log("Inside updateQuestion request ", request);
  const publishExamData = JSON.parse(request.event.body);
  console.log("Inside updateQuestion publishExamData ", publishExamData);

  if (
    !publishExamData ||
    !publishExamData.paper ||
    !publishExamData.questionsData
  ) {
    console.log("Incomplete data provided for publishing the exam");
    return {
      statusCode: 400,
      body: "Incomplete data provided for publishing the exam",
    };
  }

  const paper = publishExamData.paper;
//  const questionsData = publishExamData.questionsData;
  let questionsData = publishExamData.questionsData;
  //  const currentdate = new Date().toISOString();

// Group questions by section
const sectionMap = new Map();
for (const question of questionsData) {
  const section = question.section || "Default Section"; // Handle empty section names
  if (!sectionMap.has(section)) {
    sectionMap.set(section, []);
  }
  sectionMap.get(section).push(question);
}

// Flatten grouped questions back into an array
questionsData = Array.from(sectionMap.values()).flat();

console.log("Grouped questionsData:", questionsData);

  //Get user profile details for the paper as add it to the paper data.
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);

    const existingUserProfile = await getUserProfileData(userid);
    console.log("existingUserProfile is -->> ", existingUserProfile);
    if (
      existingUserProfile &&
      existingUserProfile.firstname &&
      existingUserProfile.useremail
    ) {
      // If user profile exists, add the user fname and lname in the paper data
      paper.firstname = existingUserProfile.firstname;
      paper.lastname = existingUserProfile.lastname;
      console.log(
        "User profile data is updated. paper with user detail -->> .",
        paper
      );
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile data is not updated. Cannot publish paper.");
      return {
        statusCode: 200,
        body: "User profile data is not updated. Cannot publish paper. Please update Profile",
      };
    }
  } catch (err) {
    console.log("Error fetching user profile data:", err);
    return { statusCode: 500, body: "Error fetching user profile data" };
  }

   // Fetch and replace images in questionsData
   const updatedQuestionsData = await fetchAndReplaceImages(paper.pid, questionsData);

  // Creating a new file for exam with the file names as paperid
  const examQuestionsparams = {
    Bucket: assetBucket,
    Key: `examquestions/${paper.pid}`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedQuestionsData)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  try {
    await s3.upload(examQuestionsparams).promise();
  } catch (err) {
    console.error("Error updating exam questions data:", err);
    return { statusCode: 500, body: "Error updating exam questions data" };
  }

  const publishExamparams = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`, // Use the key format used during upload
  };

  // Retrieve existing papers data from S3
  let existingData = "";
  let fileExists = false;
  try {
    const data = await s3.getObject(publishExamparams).promise();
    console.log("Raw Data as retrieved from S3", data);
    existingData = unzipData(data.Body.toString()); // Unzip the data
    console.log("Existing Data:", existingData);
    fileExists = true;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code !== "NoSuchKey") {
      console.error("Error getting existing file:", error);
      return { statusCode: 500, body: "Error getting papers file" };
    }
  }

  // Check if the paper with the same paper id exists. This will retun the index on which the paper is found else will retun -1 if paper is not found
  const existingPaperIndex = existingData
    ? JSON.parse(existingData).findIndex(
      (existingPaper) => existingPaper.pid === paper.pid
    )
    : -1;

  console.log("Existing Paper Index:", existingPaperIndex);

  // Append new exam data to existing data or create a new array if no data exists
  let updatedExamArray = [];

  //if index is not equal to -1 than we have found paper in the file and index number will be on which the paper is found else we append a new paper in file
  if (existingPaperIndex !== -1) {
    // Replace the existing paper
    updatedExamArray = JSON.parse(existingData);
    console.log("Existing Data:", existingData);

    // If paper exist than we want to retain the existing rating as save user feedback updated the rating in sp.txt file. we do not want to loose the old updated rating for that paper
    const existingRating = updatedExamArray[existingPaperIndex].rating;
    paper.rating = existingRating !== undefined ? existingRating : paper.rating;

    const existingNoOfReviews =
      updatedExamArray[existingPaperIndex].noofreviews;
    paper.noofreviews =
      existingNoOfReviews !== undefined
        ? existingNoOfReviews
        : paper.noofreviews;

    updatedExamArray[existingPaperIndex] = paper;
    console.log("Updated Data:", updatedExamArray);
  } else {
    // Append the new paper
    updatedExamArray = existingData ? JSON.parse(existingData) : [];
    console.log("Existing Data:", existingData);

    updatedExamArray.push(paper);
    console.log("Updated Data:", updatedExamArray);
    console.log(
      "JSON.stringify(updatedExamArray) -->> ",
      JSON.stringify(updatedExamArray)
    );
  }

  // Save updated data to S3
  const updatedPublishExamparams = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedExamArray)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  console.log("Updated Publish Exam Params:", updatedPublishExamparams);

  // Update or create the file in S3
  try {
    await s3.upload(updatedPublishExamparams).promise();
  } catch (error) {
    console.error("Error updating or creating the file:", error);
    return { statusCode: 500, body: "Error updating or creating the file" };
  }

  // Update DynamoDB item with published status
  const params = {
    TableName: submittedPapersTable,
    Key: {
      userid: request.event.requestContext.authorizer.jwt.claims.username,
      paperid: paper.pid,
    },
    UpdateExpression: "SET published = :published",
    ExpressionAttributeValues: {
      ":published": 1,
    },
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  // Execute DynamoDB update
  try {
    console.log("update published status DB Params -> ", params);
    const result = await dynamoDBExam.update(params).promise();
    console.log("Exam Published Successfully:", JSON.stringify(result));
    return { statusCode: 200, body: "Exam Published Successfully." };
  } catch (err) {
    console.error("Unable to update published status. Error:", err);
    return {
      statusCode: 500,
      body: "Error updating published status",
    };
  }
};

// Creates a new question for a Exam - one by one
const addQuestion = async (request, response) => {
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

// Uploading all the questions from a file
const uploadQuestionsFile = async (request, response) => {
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

// ####### ---- addQuestions functions -->> Start ---- ########

// Deletes a question
const deleteQuestion = async (request, response) => {
  const params = {
    TableName: paperQuestionsTable,
    Key: {
      questionId: request.pathVariables.questionId,
      questionText: `Question#${request.pathVariables.questionid}`,
    },
  };
  await dynamoDBExam.delete(params).promise();
  return response.output({}, 200);
};

// Function to obfuscate column names
const obfuscateColumnNamesGSPU = (item) => {
  const obfuscatedMapping = {
    examdesc: "paperdesc",
    numofq: "qcount",
    paperprice: "price",
    atime: "examtime",
    cat: "category",
    subcat: "subcategory",
    difflvl: "difflvl",
    subcatl2: "subcategorylvl2",
    paperid: "pid",
    examtitle: "papertitle",
    paperrating: "rating",
    reviewcount: "noofreviews",
    sections: "sections",
  };

  const obfuscatedItem = {};
  Object.keys(item).forEach((key) => {
    if (obfuscatedMapping[key]) {
      obfuscatedItem[obfuscatedMapping[key]] = item[key];
    }
  });

  return obfuscatedItem;
};

// Get all submitted papers for a user
const getSubmittedPapersForUser = async (request, response) => {
  const params = {
    TableName: submittedPapersTable,
    KeyConditionExpression: "userid = :userId",
    ExpressionAttributeValues: {
      ":userId": request.event.requestContext.authorizer.jwt.claims.username,
    },
    ProjectionExpression:
      "examdesc, numofq, paperprice, atime, cat, subcat, difflvl, subcatl2, paperid, examtitle, paperrating, reviewcount, sections",
  };

  try {
    const result = await dynamoDBExam.query(params).promise();

    // Obfuscate column names before sending in the API response
    const obfuscatedResults = result.Items.map((item) =>
      obfuscateColumnNamesGSPU(item)
    );

    return obfuscatedResults;
  } catch (err) {
    console.error(
      "getSubmittedPapersForUser - Error getting submitted papers for user",
      err
    );
    throw err;
  }
};

// Get Count of questions for a paper
const getQuestionsCount = async (request, response) => {
  const params = {
    TableName: paperQuestionsTable,
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

//Get all papers for a user
const getPaperMstr = async (request, response) => {
  try {
    const papers = await getSubmittedPapersForUser(
      request.event.requestContext.authorizer.jwt.claims.username
    );
    response.status(200).json(papers);
  } catch (err) {
    console.error("Error getting all submitted papers for user", err);
    response.status(500).json({ error: "Failed to get submitted papers" });
  }
};

// Verfiy if the user has purchased the exam, if paperid exists in myCoursesTable then send true else false
const verifyPaperOwnership = async (userid, paperid) => {
  try {
    console.log("In verifyPaperOwnership 1.0 -> paperid -->> ", paperid);
    console.log("In verifyPaperOwnership 1.0 -> userid -->> ", userid);
    const params = {
      TableName: submittedPapersTable,
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
const getSPQuestions = async (request, response) => {
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
const getSPQuestionsReviewAnswers = async (request, response) => {
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

// Get all questions for a Exam for a paperid from S3
const getExamQuestionsChildForTutorFromS3 = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log(
    "In getExamQuestionsChildForTutorFromS3 1.0 -> paperid -->> ",
    paperid
  );
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

    return examData;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code === "NoSuchKey") {
      console.error("File not found in S3: ", error);
      return [];
      //        return { statusCode: 500, body: "Error getting papers file" };
    }
    console.error("Error getting existing file:", error);
    throw new Error("Error getting exam questions file");
  }

  //  return results.Items;
};

// Get all questions for a Exam for a paperid
const getExamQuestionsChildForTutorFromDB = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestionsChildForTutor 1.0 -> paperid -->> ", paperid);
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const params = {
    TableName: paperQuestionsTable,
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

//******************* Functions for Tutor -->> End ****************************************************************************/

//******************* Functions for Student -->> Start ****************************************************************************/

// ####### ---- Add My Puchased Courses functions -->> Start ---- ############################################## //

// Get total paper price from the db to verify the actual price as the prices can be altered in the api call from UI side
const getPaperPrice = async (paperIds) => {
  try {
    const paperIdsString = paperIds.join("', '");
    console.log("PaperIdsString -> ", paperIdsString);
    const papersParams = {
      Statement: `SELECT paperprice FROM ${submittedPapersTable}.${tableNamePrefix}_GSI2 WHERE paperid IN ('${paperIdsString}')`,
    };

    console.log("papersParams-->>", papersParams);
    const papersResult = await dynamoDBPQL.queryPartiQL(papersParams);
    console.log("papersResult-->>", papersResult);

    // Extract numeric values from the items and calculate total price
    const totalPrice = papersResult.Items.reduce((sum, item) => {
      const price = parseFloat(item.paperprice.S);
      return sum + price;
    }, 0);

    return totalPrice;
  } catch (err) {
    console.error("getPaperPrice - Error getting paper price", err);
    throw err;
  }
};

// Get total package price from the db to verify the actual price as the prices can be altered in the api call from UI side
const getPackagePrice = async (packageIds) => {
  try {
    const packageIdsString = packageIds.join("', '");
    console.log("packageIdsString -> ", packageIdsString);
    const packagesParams = {
      Statement: `SELECT packageprice FROM ${packageTable}.${tableNamePrefix}_GSI1 WHERE packageid IN ('${packageIdsString}')`,
    };

    console.log("packagesParams-->>", packagesParams);
    const packagesResult = await dynamoDBPQL.queryPartiQL(packagesParams);
    console.log("packagesResult-->>", packagesResult);

    // Extract numeric values from the items and calculate total price
    const totalPrice = packagesResult.Items.reduce((sum, item) => {
      const price = parseFloat(item.packageprice.S);
      return sum + price;
    }, 0);

    return totalPrice;
  } catch (err) {
    console.error("Error getting Package price", err);
    throw err;
  }
};

const calculateTotalPrice = (papers) => {
  return papers.reduce((total, paper) => total + parseFloat(paper.price), 0);
};

const addMyCoursesForUser = async (request, response) => {
  console.log("Inside addMyCoursesForUser request ", request);
  const records = JSON.parse(request.event.body);
  
  if (!records) return { statusCode: 400, body: "No JSON data provided" };
  const cartItemsRecords = records.cartItems;
  const paymentMethod = records.paymentMethod || "wallet"; // Default to wallet
  const paymentData = records.amount || {}; // Additional payment data for Razorpay/PhonePe
  console.log("cartItemsRecords -> ", cartItemsRecords);
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  
  // Filter packages and papers
  const purchasedpackages = cartItemsRecords.filter((record) => record.itemCat === "package");
  const purchasedpapers = cartItemsRecords.filter((record) => record.itemCat === "paper");

  console.log("Packages:", purchasedpackages);
  console.log("Papers:", purchasedpapers);

  // Get package and paper IDs
  const purchasedpackageIds = purchasedpackages.map((record) => record.itemId);
  const purchasedpaperIds = purchasedpapers.map((record) => record.itemId);

  console.log("Package IDs:", purchasedpackageIds);
  console.log("Paper IDs:", purchasedpaperIds);

  // Calculate total purchase price from request
  const totalPurchasePrice = calculateTotalPrice(cartItemsRecords);
  
  try {
    let totalPaperPriceFromDB = 0;
    let totalPackagePriceFromDB = 0;

    if (purchasedpaperIds.length > 0) {
      totalPaperPriceFromDB = await getPaperPrice(purchasedpaperIds);
      console.log("totalPaperPriceFromDB -->> ", totalPaperPriceFromDB);
      if (!totalPaperPriceFromDB || totalPaperPriceFromDB.error) {
        console.log("Error fetching paper price. Please try again later.");
        return { statusCode: 500, body: "Error fetching paper price. Please try again later." };
      }
    }

    if (purchasedpackageIds.length > 0) {
      totalPackagePriceFromDB = await getPackagePrice(purchasedpackageIds);
      console.log("totalPackagePriceFromDB -->> ", totalPackagePriceFromDB);
      if (!totalPackagePriceFromDB || totalPackagePriceFromDB.error) {
        console.log("Error fetching package price. Please try again later.");
        return { statusCode: 500, body: "Error fetching package price. Please try again later." };
      }
    }

    const totalPriceFromDB = totalPaperPriceFromDB + totalPackagePriceFromDB;
    console.log("totalPriceFromDB = (totalPaperPriceFromDB + totalPackagePriceFromDB) -->> ", totalPriceFromDB);

    // Check if total price matches expected price (prevention against price tampering)
    if (totalPurchasePrice !== totalPriceFromDB) {
      console.log("Suspecting price alteration. Please contact the admin team.");
      return { statusCode: 200, body: "Suspecting price alteration. Please contact the admin team." };
    }
  } catch (err) {
    console.log("Error getting paper/package price:", err);
    return { statusCode: 500, body: "Error getting paper/package price" };
  }

  try {
    console.log("[addMyCoursesForUser] - paymentMethod -->> ", paymentMethod);
    console.log("[addMyCoursesForUser] - userId -->> ", userId);
    console.log("[addMyCoursesForUser] - totalPurchasePrice -->> ", totalPurchasePrice);
    console.log("[addMyCoursesForUser] - paymentData -->> ", paymentData);
    const paymentInstance = PaymentFactory.createPayment(paymentMethod, userId, totalPurchasePrice, paymentData);
    const paymentResponse = await paymentInstance.processPayment();
    console.log("Inside addMyCoursesForUser - paymentResponse ", paymentResponse);

    if (paymentMethod === "wallet") {
      console.log("Inside addMyCoursesForUser - paymentMethod === ", paymentMethod);
      if (paymentResponse.statusCode === 200) {
          // If payment is verified, add courses
          try {
            for (const record of purchasedpackages) {
              console.log(`In addMyCoursesForUser - Processing record-> `, record);
              await addMyCourse(record, userId);
            }
            return { statusCode: 200, body: "Courses added successfully" };
          } catch (error) {
            console.error("Error inserting courses:", error);
            return { statusCode: 500, body: "Error inserting courses into database" };
          }
        } else {
          return { statusCode: 200, body: "Payment failed using wallet" };
        }
    }

    if (paymentMethod === "razorpay") {
      if (paymentResponse.statusCode === 200) {
          return paymentResponse;
        } else {
          return { statusCode: 200, body: "Payment failed" };
        }
    }

    if (paymentMethod === "phonepe") {
      if (paymentResponse.statusCode === 200) {
          return paymentResponse;
        } else {
          return { statusCode: 200, body: "Payment failed" };
        }
    }

    // console.log("Inside addMyCoursesForUser - Storing purchased courses");
    // for (const record of cartItemsRecords) {
    //   try {
    //     console.log(`In addMyCoursesForUser - Processing record -> `, record);
    //     await addMyCourse(record, userId);
    //   } catch (err) {
    //     console.log("Error inserting JSON data into Database:", err);
    //     return { statusCode: 500, body: "Error inserting JSON data into Database" };
    //   }
    // }

    // return { statusCode: 200, body: "Data uploaded successfully" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { statusCode: 500, body: "Error processing payment" };
  }
};

/*

// Add my purchased course - multiple records. This function then calls addMyCourse in a for loop to insert courses one by one
const addMyCoursesForUser = async (request, response) => {
  console.log("Inside addMyCoursesForUser request ", request);
  const records = JSON.parse(request.event.body);
  if (!records) {
    console.log("Inside addMyCoursesForUser 1.3 ");
    return { statusCode: 400, body: "No JSON data provided" };
  }
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  const totalPurchasePrice = calculateTotalPrice(records);
  let walletBalance = 0;
  const userWalletBalance = await getUserWalletBalanceChild(userId);
  console.log(
    "Inside addMyCoursesForUser 1.5 userWalletBalance ",
    userWalletBalance
  );

  if (userWalletBalance === null) {
    // User not found, return 0
    walletBalance = 0;
  } else if (userWalletBalance !== null && userWalletBalance !== undefined) {
    // User profile exists, return the credits
    walletBalance = userWalletBalance;
  } else {
    // Handle other cases, where there is an error or the response is unexpected
    console.log("Could not fetch Wallet Balance.");
    return { statusCode: 204, body: "Could not fetch Wallet Balance." };
  }

  // Check if the user has enough balance in the wallet
  if (totalPurchasePrice > userWalletBalance) {
    console.log("Wallet balance is not sufficient.");
    return { statusCode: 200, body: "Wallet balance is not sufficient." };
  }

  // // Extract unique paper ids from records
  // const paperIds = Array.from(new Set(records.map((record) => record.pid)));
  // console.log("Inside addMyCoursesForUser 1.6 paperIds ", paperIds);

  // Filter packages
  const purchasedpackages = records.filter(
    (record) => record.itemCat === "package"
  );

  // Filter papers
  const purchasedpapers = records.filter(
    (record) => record.itemCat === "paper"
  );

  console.log("Packages:", purchasedpackages);
  console.log("Papers:", purchasedpapers);

  // Filter packages
  const purchasedpackageIds = records
    .filter((record) => record.itemCat === "package")
    .map((record) => record.itemId);

  // Filter papers
  const purchasedpaperIds = records
    .filter((record) => record.itemCat === "paper")
    .map((record) => record.itemId);

  console.log("Package IDs:", purchasedpackageIds);
  console.log("Paper IDs:", purchasedpaperIds);

  try {
    let totalPaperPriceFromDB = 0;
    let totalPackagePriceFromDB = 0;

    if (purchasedpaperIds.length > 0) {
      totalPaperPriceFromDB = await getPaperPrice(purchasedpaperIds);
      console.log("totalPaperPriceFromDB -->> ", totalPaperPriceFromDB);

      // Check if totalPaperPriceFromDB is not defined or if there's an error
      if (!totalPaperPriceFromDB || totalPaperPriceFromDB.error) {
        console.log("Error fetching paper price. Please try again later.");
        return {
          statusCode: 500,
          body: "Error fetching paper price. Please try again later.",
        };
      }
    }

    if (purchasedpackageIds.length > 0) {
      totalPackagePriceFromDB = await getPackagePrice(purchasedpackageIds);
      console.log("totalPackagePriceFromDB -->> ", totalPackagePriceFromDB);

      // Check if totalPackagePriceFromDB is not defined or if there's an error
      if (!totalPackagePriceFromDB || totalPackagePriceFromDB.error) {
        console.log("Error fetching package price. Please try again later.");
        return {
          statusCode: 500,
          body: "Error fetching package price. Please try again later.",
        };
      }
    }

    const totalPriceFromDB = totalPaperPriceFromDB + totalPackagePriceFromDB;
    console.log(
      "totalPriceFromDB =(totalPaperPriceFromDB+totalPackagePriceFromDB) -->> ",
      totalPriceFromDB
    );
    // Check if the user has enough balance in the wallet
    if (totalPurchasePrice !== totalPriceFromDB) {
      console.log(
        "Suspecting price alteration. Please contact the admin team."
      );
      return {
        statusCode: 200,
        body: "Suspecting price alteration. Please contact the admin team.",
      };
    }
  } catch (err) {
    console.log("Error getting paper price:", err);
    return {
      statusCode: 500,
      body: "Error getting paper price",
    };
  }

  console.log("Inside addMyCoursesForUser 1.4 records is ", records);
  for (const record of records) {
    // if (!record.hasOwnProperty('question') || !record.hasOwnProperty('option1') || !record.hasOwnProperty('option2') || !record.hasOwnProperty('option3') || !record.hasOwnProperty('option4') || !record.hasOwnProperty('answer')) {
    //   console.log('Skipping record as it does not have all required fields:', JSON.stringify(record));
    //   continue;
    // }
    try {
      console.log(`In addMyCoursesForUser  1 record -> `, record);
      const results = await addMyCourse(record, userId);
    } catch (err) {
      console.log("Error inserting JSON data into Database:", err);
      return {
        statusCode: 500,
        body: "Error inserting JSON data into Database",
      };
    }
  }

  // Update wallet balance after successful course purchase
  const newWalletBalance = userWalletBalance - totalPurchasePrice;
  try {
    const updatedBalance = await updateUserWalletBalance(
      userId,
      newWalletBalance
    );
    console.log(
      "Updated wallet balance after successful course purchase:",
      updatedBalance
    );
  } catch (err) {
    console.log("Error updating user wallet balance:", err);
    return { statusCode: 500, body: "Error updating user wallet balance" };
  }

  return { statusCode: 200, body: "Data uploaded successfully" };
};

*/

// Add my purchased course - single record
const addMyCourse = async (record, userid) => {
  try {
    const today = new Date();
    const purchaseDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    //    const currentdate = new Date().toISOString();
    const params = {
      TableName: myCoursesTable,
      Item: {
        userid: userid,
        paperid: record.itemId,
        purchasedt: purchaseDate,
        purchaseprice: record.price,
        itemCategory: record.itemCat,
        //        "crtdt": currentdate,
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB addMyCoursesForUser Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Data inserted successfully." };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

// ####### ---- Add My Puchased Courses functions -->> End ---- ############################################## //

// ####### ---- Get My Puchased Courses functions -->> Start ---- ############################################## //

//Get student's all purchased courses. First step is to retrieve all the exam papers which the student has purchased and then
// then query the submittedPapersTable to get the paper title, desc etc which will be displayed on the page
const getMyCoursesForUserFromS3 = async (request, response) => {
  try {
    console.log("getMyCoursesForUser-->> 1.0 ");
    console.log("getMyCoursesForUser-->> 1.0 ", request);
    const params = {
      TableName: myCoursesTable,
      KeyConditionExpression: "userid = :userId",
      ExpressionAttributeValues: {
        ":userId": request.event.requestContext.authorizer.jwt.claims.username,
      },
    };

    console.log("getMyCoursesForUser params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();
    console.log("getMyCoursesForUser result-->> ", result);
    if (result.Items && result.Items.length > 0) {
      //      const paperIds = result.Items.map((item) => item.paperid);
      const paperIds = result.Items.filter(
        (item) => item.itemCategory === "paper"
      ).map((item) => item.paperid);
      const packageIds = result.Items.filter(
        (item) => item.itemCategory === "package"
      ).map((item) => item.paperid);

      //      const sbResults1 = await getPaperDetails(paperIds);
      const sbResults1 = await getPaperDetailsFromS3(paperIds);
      console.log("sbResults1-->> ", sbResults1);

      // Include examtakenflag in the response
      const enrichedPaperData = sbResults1.map((item) => {
        const correspondingItem = result.Items.find(
          (course) => course.paperid === item.pid
        );

        const examtakenflag = correspondingItem
          ? correspondingItem.examtakenflag !== undefined
            ? correspondingItem.examtakenflag
            : 0
          : 0; // Use 0 as the default value when examtakenflag is not found or undefined
        console.log(
          "In getMyCoursesForUser examtakenflag -->> ",
          examtakenflag
        );
        const examtaken = examtakenflag;
        return { ...item, examtaken };
      });
      console.log(
        "In getMyCoursesForUser enriched results -->> ",
        enrichedPaperData
      );

      const packageDetails = await getPackageDetailsFromS3(packageIds);

      // Combine paper and package details
      paperandPackageDataCombined = {
        enrichedPaperData,
        packageDetails,
      };
      console.log(
        "paperandPackageDataCombined -->> ",
        paperandPackageDataCombined
      );
      return paperandPackageDataCombined;
    } else {
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ message: "CME1001 - No papers available" }),
      // };
      return [];
    }
  } catch (err) {
    console.error("Error getting my courses", err);
    throw err;
  }
};

//get Courses for user for a particular Package
const getPackCoursesForUserFromS3 = async (request, response) => {
  try {
    console.log("getPackCoursesForUserFromS3-->> 1.0 ");
    console.log("getPackCoursesForUserFromS3-->> 1.0 ", request);
    //paperIds = request.pathVariables.packPaperIDs;
    jsonRequest = JSON.parse(request.event.body);
    paperIds = jsonRequest.packPaperIDs;
    const params = {
      TableName: myCoursesTable,
      KeyConditionExpression: "userid = :userId",
      ExpressionAttributeValues: {
        ":userId": request.event.requestContext.authorizer.jwt.claims.username,
      },
    };

    console.log("getPackCoursesForUserFromS3 params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();
    console.log("getPackCoursesForUserFromS3 result-->> ", result);
    if (result.Items && result.Items.length > 0) {
      const sbResults1 = await getPaperDetailsFromS3(paperIds);
      console.log("sbResults1-->> ", sbResults1);

      // Include examtakenflag in the response
      const enrichedPaperData = sbResults1.map((item) => {
        const correspondingItem = result.Items.find(
          (course) => course.paperid === item.pid
        );

        const examtakenflag = correspondingItem
          ? correspondingItem.examtakenflag !== undefined
            ? correspondingItem.examtakenflag
            : 0
          : 0; // Use 0 as the default value when examtakenflag is not found or undefined
        console.log(
          "In getPackCoursesForUserFromS3 examtakenflag -->> ",
          examtakenflag
        );
        const examtaken = examtakenflag;
        return { ...item, examtaken };
      });
      console.log(
        "In getPackCoursesForUserFromS3 enriched results -->> ",
        enrichedPaperData
      );

      //      const packageDetails = await getPackageDetailsFromS3(packageIds);

      // Combine paper and package details
      paperandPackageDataCombined = {
        enrichedPaperData,
        //      packageDetails
      };
      console.log(
        "paperandPackageDataCombined -->> ",
        paperandPackageDataCombined
      );
      return paperandPackageDataCombined;
    } else {
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ message: "CME1001 - No papers available" }),
      // };
      return [];
    }
  } catch (err) {
    console.error("Error getting pack courses", err);
    throw err;
  }
};

//Get paper details for the specific paperIds
const getPaperDetailsFromS3 = async (paperIds) => {
  // Fetch submitted papers from S3
  console.log("In getPaperDetailsFromS3 1.0 paperIds -->> ", paperIds);
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    let unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data

    // Ensure unzippedData is an array
    let papersArray;
    if (Array.isArray(unzippedData)) {
      papersArray = unzippedData;
    } else {
      // Parse the string data into an array
      try {
        papersArray = JSON.parse(unzippedData);
      } catch (error) {
        console.error("Error parsing unzippedData:", error);
        throw error;
      }
    }

    console.log("Papers Array -->> ", papersArray);

    // Filter out papers based on provided paperIds
    const filteredPapers = papersArray.filter((paper) =>
      paperIds.includes(paper.pid.toString())
    );
    console.log("Filtered Papers", filteredPapers);

    return filteredPapers;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get student's all purchased packs. First step is to retrieve all the exam packs which the student has purchased and
// then query the submittedPapersTable to get the paper title, desc etc which will be displayed on the page
const getMyLearningPacksFromS3 = async (request, response) => {
  try {
    console.log("getMyLearningPacksFromS3-->> 1.0 ");
    console.log("getMyLearningPacksFromS3-->> 1.0 ", request);
    const params = {
      TableName: myCoursesTable,
      KeyConditionExpression: "userid = :userId",
      ExpressionAttributeValues: {
        ":userId": request.event.requestContext.authorizer.jwt.claims.username,
      },
    };

    console.log("getMyLearningPacksFromS3 params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();
    console.log("getMyLearningPacksFromS3 result-->> ", result);
    if (result.Items && result.Items.length > 0) {
      const packageIds = result.Items.filter(
        (item) => item.itemCategory === "package"
      ).map((item) => item.paperid);

      const packageDetails = await getPackageDetailsFromS3(packageIds);

      console.log("packageDetails -->> ", packageDetails);
      return packageDetails;
    } else {
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ message: "CME1001 - No papers available" }),
      // };
      return [];
    }
  } catch (err) {
    console.error("Error getting my learning packs", err);
    throw err;
  }
};

//Get paper details for the specific paperIds
const getPackageDetailsFromS3 = async (paperIds) => {
  // Fetch submitted papers from S3
  console.log("In getPackageDetailsFromS3 1.0 paperIds -->> ", paperIds);
  const s3Params = {
    Bucket: assetBucket,
    Key: `packages/package.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    let unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data

    // Ensure unzippedData is an array
    let papersArray;
    if (Array.isArray(unzippedData)) {
      papersArray = unzippedData;
    } else {
      // Parse the string data into an array
      try {
        papersArray = JSON.parse(unzippedData);
      } catch (error) {
        console.error("Error parsing unzippedData:", error);
        throw error;
      }
    }

    console.log("Papers Array -->> ", papersArray);

    // Filter out papers based on provided paperIds
    const filteredPapers = papersArray.filter((paper) =>
      paperIds.includes(paper.packid.toString())
    );
    console.log("Filtered Papers", filteredPapers);

    return filteredPapers;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

const getMyLearningPacksFromDB = async (request, response) => {
  try {
    console.log("getMyLearningPacksFromDB-->> 1.0 ");
    console.log("getMyLearningPacksFromDB-->> 1.0 ", request);
    const params = {
      TableName: packageTable,
      KeyConditionExpression: "userid = :userId",
      ExpressionAttributeValues: {
        ":userId": request.event.requestContext.authorizer.jwt.claims.username,
      },
      ProjectionExpression:
        "packagetitle, packagepapers, packageid, packageprice, packagedesc, reviewcount, packagerating",
    };

    console.log("getMyLearningPacksFromDB params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();
    console.log("getMyLearningPacksFromDB result-->> ", result);
    if (result.Items && result.Items.length > 0) {
      // Transform attribute names
      const transformedResult = result.Items.map((item) => ({
        packTitle: item.packagetitle,
        selectedPapers: item.packagepapers,
        packid: item.packageid,
        packPrice: item.packageprice,
        packDesc: item.packagedesc,
        reviewcount: item.reviewcount,
        packrating: item.packagerating,
      }));

      return transformedResult;
    } else {
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ message: "CME1001 - No papers available" }),
      // };
      return [];
    }
  } catch (err) {
    console.error("Error getting my learning packs", err);
    throw err;
  }
};

//Get student's all purchased courses. First step is to retrieve all the exam papers which the student has purchased and then
// then query the submittedPapersTable to get the paper title, desc etc which will be displayed on the page
const getMyCoursesForUser = async (request, response) => {
  try {
    console.log("getMyCoursesForUser-->> 1.0 ");
    console.log("getMyCoursesForUser-->> 1.0 ", request);
    const params = {
      TableName: myCoursesTable,
      KeyConditionExpression: "userid = :userId",
      ExpressionAttributeValues: {
        ":userId": request.event.requestContext.authorizer.jwt.claims.username,
      },
    };

    console.log("getMyCoursesForUser params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();
    console.log("getMyCoursesForUser result-->> ", result);
    if (result.Items && result.Items.length > 0) {
      const paperIds = result.Items.map((item) => item.paperid);
      const sbResults1 = await getPaperDetails(paperIds);
      console.log("sbResults1-->> ", sbResults1);
      // Extract values and anonymize keys/column names before sending to frontend
      const extractedResults = sbResults1.Items.map((item) =>
        extractValues(item)
      );

      // Include examtakenflag in the response
      const enrichedResults = extractedResults.map((item) => {
        const correspondingItem = result.Items.find(
          (course) => course.paperid === item.paperid
        );

        const examtakenflag = correspondingItem
          ? correspondingItem.examtakenflag !== undefined
            ? correspondingItem.examtakenflag
            : 0
          : 0; // Use 0 as the default value when examtakenflag is not found or undefined
        console.log(
          "In getMyCoursesForUser examtakenflag -->> ",
          examtakenflag
        );
        return { ...item, examtakenflag };
      });
      console.log(
        "In getMyCoursesForUser enriched results -->> ",
        enrichedResults
      );

      const anonymizedResults = enrichedResults.map((item) =>
        anonymizeKeys(item)
      );
      console.log(
        "In getMyCoursesForUser anonymizedResults -->> ",
        anonymizedResults
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ Items: anonymizedResults }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "CME1001 - No papers available" }),
      };
    }
  } catch (err) {
    console.error("Error getting my courses", err);
    throw err;
  }
};

// Get paper details for each paperIds. This is required for showing pper details to student for their purchased courses
const getPaperDetails = async (paperIds) => {
  try {
    // //-----------------Keep for Reference----------------------//
    //     //Using DynamoDB API - not working (This logic works for Primary Keys and does not work for Indexs)
    //     const papersParams = {
    //       RequestItems: {
    //         [submittedPapersTable]: {
    //           Keys: [{ "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 6}, { "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 7}],
    //           ProjectionExpression: "paperid",
    // //          IndexName: `${tableNamePrefix}_GSI2`,
    //         }
    //       }
    //     };
    //     console.log("papersParams-->>", papersParams);

    //     // Retrieve the papers from the submittedPapers table
    //     const papersResult = await dynamoDBExam.batchGet(papersParams).promise();
    //     console.log("Data Retreived successfully ");
    // //-----------------Keep for Reference----------------------//

    //    using PartiQL
    //    const userId = '3c18395e-dbc9-4096-b530-8479bd3ec4a1';
    const paperIdsString = paperIds.join("', '");
    console.log("PaperIdsString -> ", paperIdsString);
    const papersParams = {
      //      Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE paperid IN (${paperIds.map(() => "?").join(",")}) AND dummycolumn = 1`,
      //      Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE paperid IN (6,7) AND userid = "3c18395e-dbc9-4096-b530-8479bd3ec4a1"`,
      Statement: `SELECT paperid, examtitle, examdesc, numofq, paperrating, reviewcount, atime FROM ${submittedPapersTable}.${tableNamePrefix}_GSI2 WHERE paperid IN ('${paperIdsString}')`,

      //      Statement: `SELECT userid FROM ${submittedPapersTable} WHERE userid = '${userId}'`

      //      Parameters: paperIds,
    };

    console.log("papersParams-->>", papersParams);
    const papersResult = await dynamoDBPQL.queryPartiQL(papersParams);

    // return purchasedCourses;
    return papersResult;
  } catch (err) {
    console.error(
      "getPaperDetails - Error getting submitted papers for user",
      err
    );
    throw err;
  }
};

// ####### ---- Get My Puchased Courses functions -->> End ---- ############################################## //

// ####### ---- Get Exam Questions functions -->> Start ---- ############################################## //

const verifyTutorPackRel = async (userid, packid, paperid) => {
  try {
    console.log("In verifyPackPaperRel 1.0 -> packid -->> ", packid);
    console.log("In verifyPackPaperRel 1.0 -> paperid -->> ", paperid);
    console.log("In verifyPackPaperRel 1.0 -> userid -->> ", userid);
    // Query parameters to retrieve packagepapers for the given user and packid
    const params = {
      TableName: packageTable,
      KeyConditionExpression: "userid = :userid AND packageid = :packid",
      ExpressionAttributeValues: {
        ":userid": userid,
        ":packid": packid,
      },
      ProjectionExpression: "packagepapers",
    };

    console.log("params in verifyPackPaperRel 2.0 -> ", params);
    // Query the database to get the packagepapers associated with the packid
    const results = await dynamoDBExam.query(params).promise();
    console.log("results in verifyPackPaperRel 2.0 -> ", results);
    // If the result contains items, check if the paperid is included in the packagepapers
    if (results.Items.length > 0) {
      const packagePapers = results.Items[0].packagepapers; // Assuming there's only one package for the user and packid
      console.log("packagePapers in verifyPackPaperRel 2.0 -> ", packagePapers);
      // Check if the paperid is in the packagePapers array
      const paperidIncluded = packagePapers.includes(paperid);
      console.log(
        "paperidIncluded in verifyPackPaperRel 2.0 -> ",
        paperidIncluded
      );
      return paperidIncluded;
    } else {
      // If no package found, return false
      return false;
    }
  } catch (error) {
    console.error("Error verifying user purchase:", error);
    throw error;
  }
};

const verifyPackPaperRel = async (userid, packid, paperid) => {
  try {
    console.log("In verifyPackPaperRel -> packid:", packid);
    console.log("In verifyPackPaperRel -> paperid:", paperid);
    console.log("In verifyPackPaperRel -> userid:", userid);

    // Construct query parameters
    const params = {
      TableName: packageTable,
      IndexName: `${tableNamePrefix}_GSI1`, // Ensure the index is correctly configured
      KeyConditionExpression: "packageid = :packid",
      ExpressionAttributeValues: {
        ":packid": packid,
      },
      ProjectionExpression: "packagepapers",
    };

    console.log("Query parameters:", JSON.stringify(params, null, 2));

    // Perform the query
    const results = await dynamoDBExam.query(params).promise();
    console.log("Query results:", JSON.stringify(results, null, 2));

    // Check for results and validate packagepapers
    if (results.Items && results.Items.length > 0) {
      const packagePapers = results.Items[0].packagepapers; // Assuming only one item per packid
      console.log("Retrieved packagePapers:", packagePapers);

      // Validate that packagePapers is an array of objects with "S" property
      if (Array.isArray(packagePapers)) {
        const paperidIncluded = packagePapers.some(
          (paper) => paper === paperid
        );
        console.log("Is paperid included:", paperidIncluded);
        return paperidIncluded;
      } else {
        console.warn("packagePapers is not an array:", packagePapers);
        return false;
      }
    } else {
      console.log("No matching packages found for given packid.");
      return false;
    }
  } catch (error) {
    console.error("Error in verifyPackPaperRel:", error);
    throw new Error("Error verifying package-paper relationship. Please try again.");
  }
};


// Verfiy if the user has purchased the exam, if paperid exists in myCoursesTable then send true else false
const verifyUserPurchase = async (userid, packid, paperid) => {
  try {
    const packPaperRel = await verifyPackPaperRel(userid, packid, paperid);
    console.log("In verifyUserPurchase 1.0 -> packPaperRel -->> ", packPaperRel);
    if (packPaperRel) {
      console.log("In verifyUserPurchase 1.0 -> paperid -->> ", paperid);
      console.log("In verifyUserPurchase 1.0 -> userid -->> ", userid);
      const params = {
        TableName: myCoursesTable,
        KeyConditionExpression: "userid = :userid AND paperid = :packid",
        ExpressionAttributeValues: {
          ":userid": userid,
          ":packid": packid,
        },
        //     FilterExpression: "paperid = :paperid",
        ProjectionExpression: "paperid",
      };

      console.log("params in verifyUserPurchase 2.0 -> ", params);
      const results = await dynamoDBExam.query(params).promise();

      // If the result contains items, then the user has purchased the exam
      if (results.Items.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
    //    return results.Items.length > 0;
  } catch (error) {
    console.error("Error verifying user purchase:", error);
    throw error;
  }
};

// Get all questions for a Exam for a paperid
const getExamQuestions = async (request, response) => {
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

const obfuscateColumnNames = (data) => {
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

// Get all questions for a Exam for a paperid from Database
const getExamQuestionsChildFromDB = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestionsChild 1.0 -> paperid -->> ", paperid);
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const params = {
    TableName: paperQuestionsTable,
    KeyConditionExpression: "paperid = :key",
    ExpressionAttributeValues: {
      //      ":key": parseInt(request.pathVariables.paperid)
      ":key": paperid,
    },
    ProjectionExpression: "paperid, qid, a, o1, o2, o3, o4, o5, qt",
    //    Limit: count
    //    IndexName: `${tableNamePrefix}_GSI1`,
  };
  console.log("params in getExamQuestions 3.0 -> ", params);
  const results = await dynamoDBExam.query(params).promise();
  if (results.Items && results.Items.length > 0) {
    // Obfuscate column names before sending to frontend
    const obfuscatedResults = results.Items.map((item) =>
      obfuscateColumnNames(item)
    );

    return obfuscatedResults;
  } else {
    console.log("No questions found for paperid ", paperid);
    return [];
  }
  //  return results.Items;
};
// ####### ---- Get Exam Questions functions -->> End ---- ############################################## //

// ####### ---- Save Results Batch functions -->> Start ---- ############################################## //

// Helper function: Map Selected Answer to Trait Score
const mapAnswerToScore = (selectedAns) => {
  // Scoring based on the response
  const scoreMapping = {
    1: 3, // Strongly Agree
    2: 2, // Agree
    3: -2, // Disagree
    4: -3, // Strongly Disagree
  };
  return scoreMapping[selectedAns] || 0; // Default to 0 if invalid
};

// // Helper function: Get Trait Mappings
// const getTraitMappings = async (paperid) => {
//   // Replace this with a DB fetch or external service call as needed
//   const traitMappingByQuestionText = {
//     "You enjoy social gatherings and meeting new people.": "Extraversion", // Q1
//     "You prefer tasks that involve working alone rather than in a team.": "Introversion", // Q2
//     "You often make decisions based on logic rather than emotions.": "Logical Thinking", // Q3
//     "You feel stressed when deadlines are approaching.": "Stress Management", // Q4
//     "You rely more on gut feelings than facts when making decisions.": "Intuition", // Q5
//     "You enjoy trying new activities and meeting people from different cultures.": "Openness", // Q6
//     "You like having a clear schedule and following it.": "Structure Preference", // Q7
//     "You feel drained after spending time in large crowds.": "Energy Levels", // Q8
//     "You find it easy to empathize with other people's feelings.": "Empathy", // Q9
//     "You frequently plan your tasks and follow a structured routine.": "Planning Skills", // Q10
//   };

//   // Simulate a fetch based on paperid if needed (e.g., to fetch mappings for different papers)
//   return traitMappingByQuestionText;
// };

// Helper function: Get Trait Mappings
const getTraitMappings = async (paperid) => {
  // Replace with a DB fetch if needed
  return {
    "01JGVN316F8REY74FQHP45GXVR": "Extraversion", // Q1
    "01JGVN319KTRBY9B1N4F9254P1": "Introversion", // Q2
    "01JGVN31BF0QTBWJS9XMNQPSX6": "Logical Thinking", // Q3
    "01JGVN31DB92TFBK42W438KYQ8": "Stress Management", // Q4
    "01JGVN31F78A22N82ZYB5A7EE4": "Intuition", // Q5
    "01JGVN31H3VJQT8RG1QRZXAAM6": "Openness", // Q6
    "01JGVN31KK5NZFA0YY72WSR8DQ": "Structure Preference", // Q7
    "01JGVN31PQ05725365M7NZXH90": "Energy Levels", // Q8
    "01JGVN31QYS2AK4DKY52P7GE56": "Empathy", // Q9
    "01JGVN31STFSM4A8Q6F3V826SN": "Planning Skills", // Q10
  };
};

// Helper function: Get Trait Description
// Helper function: Get Trait Description
const getTraitDescription = (trait, score) => {
  // Define thresholds and descriptions for each trait
  const traitDescriptions = {
    Extraversion: {
      low: "You prefer solitude or small gatherings over large social settings.",
      medium: "You balance socializing with moments of introspection.",
      high: "You thrive in social settings and enjoy meeting new people.",
    },
    Introversion: {
      low: "You are highly extroverted and enjoy being around people.",
      medium: "You have a balanced mix of socializing and introspection.",
      high: "You are introverted and prefer quiet environments or close-knit groups.",
    },
    "Logical Thinking": {
      low: "You often rely on emotions over logic when making decisions.",
      medium: "You balance logical reasoning with emotional considerations.",
      high: "You rely on logic and facts to make decisions.",
    },
    "Stress Management": {
      low: "You handle deadlines calmly and thrive under pressure.",
      medium: "You feel some stress near deadlines but manage it effectively.",
      high: "You feel significant stress when deadlines approach.",
    },
    Intuition: {
      low: "You base decisions on facts and evidence over gut feelings.",
      medium: "You use a mix of intuition and factual evidence to make decisions.",
      high: "You rely heavily on gut feelings when making decisions.",
    },
    Openness: {
      low: "You prefer familiar routines and activities over trying new things.",
      medium: "You enjoy occasional new activities and cultural experiences.",
      high: "You are highly open to new experiences and cultural diversity.",
    },
    "Structure Preference": {
      low: "You are flexible and adapt well to changes in schedule.",
      medium: "You like a mix of clear schedules and spontaneous activities.",
      high: "You prefer having a clear, structured schedule to follow.",
    },
    "Energy Levels": {
      low: "You feel energized after spending time in large social settings.",
      medium: "You balance social interactions with personal recharge time.",
      high: "You feel drained after spending time in large crowds.",
    },
    Empathy: {
      low: "You find it challenging to empathize with others' feelings.",
      medium: "You empathize with others but keep emotional boundaries.",
      high: "You easily empathize with others and deeply understand their emotions.",
    },
    "Planning Skills": {
      low: "You prefer spontaneous actions over structured planning.",
      medium: "You plan tasks but allow flexibility in execution.",
      high: "You are highly organized and excel at structured planning.",
    },
  };

  // Threshold values for categorizing scores
  const thresholds = {
    low: -10,
    medium: 0,
    high: 10,
  };

  // Determine the category (low, medium, high) based on the score
  let category = "low";
  if (score > thresholds.medium && score <= thresholds.high) category = "medium";
  if (score > thresholds.high) category = "high";

  // Return the description for the trait and category
  return traitDescriptions[trait]?.[category] || "Description not available for this trait.";
};


// Helper function: Analyze Personality Assessment
const analyzePersonalityAssessment = async (examUserAnswers, paperDetails) => {
  const analysisResults = {};
  const traitMappings = await getTraitMappings(paperDetails.paperid);
  const traitScores = {};

  // Initialize scores for all traits
  for (const trait of Object.values(traitMappings)) {
    traitScores[trait] = 0;
  }

  // Analyze user answers
  examUserAnswers.forEach((answer) => {
    const questionTrait = traitMappings[answer.quesid];
    if (questionTrait && answer.selectedAns) {
      const score = mapAnswerToScore(parseInt(answer.selectedAns, 10));
      traitScores[questionTrait] += score;
    }
  });

  // Generate descriptive report
  for (const [trait, score] of Object.entries(traitScores)) {
    const description = getTraitDescription(trait, score);
    analysisResults[trait] = { score, description };
  }

  return {
    category: paperDetails.category,
    subcategory: paperDetails.subcategory,
    traits: analysisResults,
    date: new Date().toISOString(),
  };
};

// Function to generate the HPI report
function generateHPIReport(examUserAnswers, examQuestionDetails) {
  const dimensionScores = {};
  const dimensionDetails = {};

  examUserAnswers.forEach((examUserAnswers) => {
    processUserAnswer(examUserAnswers, examQuestionDetails, dimensionScores, dimensionDetails);
  });

  return calculateDimensionSummary(dimensionScores, dimensionDetails);
}

// Function to process each user answer
function processUserAnswer(examUserAnswers, examQuestionDetails, dimensionScores, dimensionDetails) {
  console.log("examUserAnswers", examUserAnswers);
  console.log("examQuestionDetails", examQuestionDetails);
  console.log("dimensionScores", dimensionScores);
  console.log("dimensionDetails", dimensionDetails);
  const questionDetails = examQuestionDetails.find(
    (q) => q.quesid === examUserAnswers.quesid
  );

  if (questionDetails) {
    const selectedOption = `op${examUserAnswers.selectedAns}`;
    const score = 6 - parseInt(examUserAnswers.selectedAns); // Assign higher scores to "strongly agree"
    const dimension = questionDetails.section;

    if (!dimensionScores[dimension]) {
      dimensionScores[dimension] = { totalScore: 0, questionCount: 0 };
      dimensionDetails[dimension] = [];
    }

    dimensionScores[dimension].totalScore += score;
    dimensionScores[dimension].questionCount++;

    // const explanation = JSON.parse(questionDetails.explanation || "{}");
     // Sanitize explanation and parse JSON
     let explanation = {};
     if (questionDetails.explanation) {
       try {
         const sanitizedExplanation = htmlToText(questionDetails.explanation, {
           wordwrap: false, // Keep JSON structure intact
           ignoreHref: true, // Ignore links if any
           ignoreImage: true, // Ignore images
         });
         explanation = JSON.parse(sanitizedExplanation); // Parse JSON
       } catch (error) {
         console.error("Failed to parse explanation JSON:", error);
       }
     }
     
    const selectedOptionText = questionDetails[selectedOption];
    const selectedExplanation = explanation[selectedOptionText] || "No explanation available";

    dimensionDetails[dimension].push({
      question: questionDetails.qtxt,
      selectedAnswer: selectedOptionText,
      interpretation: selectedExplanation,
    });
  }
}

// Function to calculate dimension summaries
function calculateDimensionSummary(dimensionScores, dimensionDetails) {
  return Object.keys(dimensionScores).map((dimension) => {
    const { totalScore, questionCount } = dimensionScores[dimension];
    const averageScore = totalScore / questionCount;

    let summary;
    if (averageScore >= 4.5) {
      summary = "High score - Strong alignment with this trait.";
    } else if (averageScore >= 3) {
      summary = "Moderate score - Balanced traits.";
    } else {
      summary = "Low score - Weak alignment with this trait.";
    }

    return {
      dimension,
      averageScore,
      summary,
      questions: dimensionDetails[dimension],
    };
  });
}

// // Function to generate a detailed report
// async function generateDetailedReport(data) {
//   // Prepare the prompt for the AI
//   const prompt = `
//   You are a psychologist interpreting Hogan Personality Inventory (HPI) results. Based on the data provided, generate a detailed report including:
//   - Key strengths and weaknesses for each dimension
//   - Recommendations for improvement
//   - Insights about the individual based on their scores
  
//   Here's the data:
//   ${JSON.stringify(data, null, 2)}
  
//   Provide a detailed and structured report.
//   `;

//   try {
//     const chatCompletionResponse = await openai.chat.completions.create({
//       model: "gpt-3.5",
//       messages: [{"role": "user", "content": prompt}],
//       max_tokens: 2000, // Adjust based on the desired response length
//       temperature: 0.7, // Control creativity
//     });
//     console.log("Detailed Report from ChatGPT:", chatCompletionResponse);

//     const detailedReport = chatCompletionResponse.data.choices[0].message.content;
//     console.log("Detailed Report from ChatGPT:", detailedReport);
//     return detailedReport;
//   } catch (error) {
//     console.error("Error generating report:", error);
//     throw new Error("Failed to generate detailed report.");
//   }
// }

//Inserting complete result for a exam - batch Insert of result for all questions
const saveResultBatch = async (request, response) => {
  try {
    console.log("Inside saveResultBatch request 1.0 ");
    console.log("Inside saveResultBatch request ", request);

    const requestBody = JSON.parse(request.event.body); 

    const examUserAnswers = requestBody.answers;
    const paperDetails = requestBody.paperDetails;

    console.log("Parsed answers:", examUserAnswers);
    console.log("Parsed paperDetails:", paperDetails);

    if (!examUserAnswers || !paperDetails) {
      return { statusCode: 400, body: "Invalid request data provided" };
    }

    const { category, subcategory, subcategorylvl2 } = paperDetails;
    console.log("category -->> ", category);
    console.log("subcategory -->> ", subcategory);
    console.log("subcategorylvl2 -->> ", subcategorylvl2);
    if (!category || !subcategory || !subcategorylvl2) {
      return { statusCode: 400, body: "Invalid paper details provided" };
    }
    const paperid = examUserAnswers[0]?.pid;
    if (!paperid) {
      return { statusCode: 400, body: "Paper ID is missing in answers" };
    }

    if (category === "Personality Assessment" && subcategorylvl2 === "Social Orientation") {
      // Personality Assessment Analysis
      const personalityReportData = await analyzePersonalityAssessment(examUserAnswers, paperDetails);
      console.log("Personality Report Data:", personalityReportData);

      // // Save personality report to database (if needed)
      // const reportParams = {
      //   TableName: personalityResultsTable,
      //   Item: {
      //     userid: request.event.requestContext.authorizer.jwt.claims.username,
      //     paperid: paperid,
      //     report: personalityReportData,
      //     date: new Date().toISOString(),
      //   },
      // };

      // await dynamoDBExam.put(reportParams).promise();

      // Respond with the generated report
      return {
        statusCode: 200,
        body: JSON.stringify(personalityReportData),
      };
    } else if (category === "Personality Assessment" && subcategorylvl2 === "Hogan Personality Inventory") {
      const examQuestionDetails = await getExamQuestionsChildForTutorFromS3(paperid);
      const jsonParsedExamQuestionDetails = JSON.parse(examQuestionDetails);
      console.log("jsonParsedExamQuestionDetails -->> ", jsonParsedExamQuestionDetails);
      const hoganPersonalityReportData = generateHPIReport(examUserAnswers, jsonParsedExamQuestionDetails);
      console.log("Hogan Personality Report:", hoganPersonalityReportData);
      // const hoganpersonalityReportAI = await generateDetailedReport(hoganPersonalityReportData);
      // console.log("Personality Report AI:", hoganpersonalityReportAI);
      return {
        statusCode: 200,
        body: JSON.stringify(hoganPersonalityReportData),
      };
    }
    else {

    const actualAnswersforPaper = await getAnswersforPaper(paperid);
    console.log("answersforPaper -->> ", actualAnswersforPaper);

    // Initialize the exam score and section wise scores
    let totalScore = 0;
    let totalPossibleScore = 0;
    let totalUnansweredQuestions = 0;
    const sectionWiseScores = {};
    const sectionWiseTotalPossibleScores = {};
    const sectionWiseQuestionCount = {};
    const sectionWiseUnansweredQuestions = {};

    const examdate = new Date().toISOString();

    const updatedAnswers = examUserAnswers.map((answer) => {
      // Find the corresponding question in actualAnswersforPaper
      const question = actualAnswersforPaper.find(
        (q) => q.qid === answer.quesid && q.paperid === answer.pid
      );
      console.log("question -->> ", question);

      // Compare the selected answer with the actual answer
      let score = 0;
      let possibleScore = 0;

      if (question) {
        possibleScore = question.qmarks; // Assign possible score based on the question
      }
      console.log("answer.selectedAns -->>", answer.selectedAns);
      // Check if user has attempted the question
      if (answer.selectedAns ?? "" !== "") {
        // Check if the question exists in the paper
        if (question) {
          const actualAnswerIndex = parseInt(question.a); // Assuming 'a' stores the correct index
          const userSelectedAnswer = parseInt(answer.selectedAns); // User's selected index
          console.log("actualAnswerIndex -->> ", actualAnswerIndex);
          console.log("userSelectedAnswer -->> ", userSelectedAnswer);

          // Calculate score based on the selected answer
          if (userSelectedAnswer === actualAnswerIndex) {
            score = question.qmarks; // Assign marks for correct answer
            console.log("Correct answer Socre is -->> ", score);
          } else {
            score = question.negmarks; // Deduct negative marks for wrong answers
          }
          //          possibleScore = question.qmarks; // Assign possible score based on the question
        }
      } else {
        totalUnansweredQuestions += 1;

        // Increment section-wise unanswered questions count
        if (question && question.examsection) {
          sectionWiseUnansweredQuestions[question.examsection] =
            (sectionWiseUnansweredQuestions[question.examsection] || 0) + 1;
        }
      }

      // Add score and possible score to the total scores
      totalScore += score;
      totalPossibleScore += possibleScore;

      // Add score to section wise scores
      if (question) {
        if (!sectionWiseScores[question.examsection]) {
          sectionWiseScores[question.examsection] = 0;
          sectionWiseTotalPossibleScores[question.examsection] = 0;
          sectionWiseQuestionCount[question.examsection] = 0;
        }
        sectionWiseScores[question.examsection] += score;
        sectionWiseTotalPossibleScores[question.examsection] += question.qmarks;
        sectionWiseQuestionCount[question.examsection]++;
      }

      // Return the updated answer object
      return {
        ...answer,
        score: score,
        examdate: examdate,
      };
    });

    // Print the exam score
    console.log(`Exam score: ${totalScore}/${totalPossibleScore}`);

    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    // Save the exam result history
    const resultHistoryParams = {
      TableName: examResultsHistoryTable,
      Item: {
        userid: userid,
        paperid: paperid + "-" + examdate,
        examscore: totalScore,
        totalquestions: examUserAnswers.length,
        examdate: examdate,
        totposscore: totalPossibleScore,
        secscores: sectionWiseScores,
        sectotposscores: sectionWiseTotalPossibleScores,
        secqcount: sectionWiseQuestionCount,
        totunansq: totalUnansweredQuestions,
        secunansq: sectionWiseUnansweredQuestions, // Include section-wise unanswered questions
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log(
      "dynamoDB createExam resultHistoryParams -> ",
      resultHistoryParams
    );

    await dynamoDBExam.put(resultHistoryParams).promise();


        // Split the updated answers into batches of 25
        const BATCH_SIZE = 25;
        const batches = [];
        for (let i = 0; i < updatedAnswers.length; i += BATCH_SIZE) {
          batches.push(updatedAnswers.slice(i, i + BATCH_SIZE));
        }
    
        // Prepare batchWrite params for DynamoDB
        const batchWriteParams = (batch) => ({
          RequestItems: {
            [examResultsTable]: batch.map((record) => ({
              PutRequest: {
                Item: {
                  pqid: record.pid + "-" + record.quesid,
                  qid: record.quesid,
                  selectedAnswer: record.selectedAns,
                  score: record.score,
                  examdate: record.examdate,
                  userid: userid,
                },
              },
            })),
          },
        });
    
        // Perform batchWrite for each batch
        for (let batch of batches) {
          const params = batchWriteParams(batch);
          console.log("dynamoDB saveResultBatch Params 1 -> ", params);
          // Use JSON.stringify to convert the object into a readable string format
          console.log("dynamoDB saveResultBatch Params 2 -> ", JSON.stringify(params, null, 2)); // 'null, 2' adds indentation for better readability

          await dynamoDBExam.batchWrite(params).promise();
        }

    updateMyCoursesExamTakenFlag(userid, paperid);

    return {
      examscore: totalScore,
      totalPossibleScore: totalPossibleScore,
      totalquestions: examUserAnswers.length,
      sectionWiseScores: sectionWiseScores,
      sectionWiseTotalPossibleScores: sectionWiseTotalPossibleScores,
      sectionWiseQuestionCount: sectionWiseQuestionCount,
      totalUnansweredQuestions: totalUnansweredQuestions,
      sectionWiseUnansweredQuestions: sectionWiseUnansweredQuestions, // Include section-wise unanswered questions
    };
  }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

// Update examtaken flag for a user and a particular exam ID
const updateMyCoursesExamTakenFlag = async (userid, paperid) => {
  try {
    console.log("Inside updateMyCoursesExamTakenFlag pid ", paperid);
    // Update examtaken flag
    const updateParams = {
      TableName: myCoursesTable, // Replace with your actual user table name
      Key: {
        userid: userid,
        paperid: paperid,
      },
      UpdateExpression: "SET examtakenflag = :examTakenValue",
      ExpressionAttributeValues: {
        ":examTakenValue": "1", // Assuming examtaken is a string attribute
      },
    };

    console.log("DynamoDB updateExamTaken Params -> ", updateParams);

    // Perform the update
    const results = await dynamoDBExam.update(updateParams).promise();

    return { statusCode: 200, body: "Exam taken flag updated successfully." };
  } catch (err) {
    console.error("Error updating exam taken flag:", err);
    return { statusCode: 500, body: "Error updating exam taken flag" };
  }
};

//Save User Feedback for the paper after the user has completed the exam
const saveUserFeedback = async (request, response) => {
  try {
    console.log("Inside saveUserFeedback request 1.0 ");
    console.log("Inside saveUserFeedback request ", request);
    const record = JSON.parse(request.event.body);

    if (!record) {
      return { statusCode: 400, body: "No JSON data provided" };
    }
    console.log("Inside saveUserFeedback userFeedback ", record.userfeedback);

    const paperid = record.pid;
    const userFeedback = record.userfeedback;
    const userRating = record.userrating;
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    const existingUserProfile = await getUserProfileData(userid);
    console.log("existingUserProfile -->> ", existingUserProfile);
    userFirstName = existingUserProfile.firstname;
    userLastName = existingUserProfile.lastname;
    userFullName = userFirstName + " " + userLastName;
    console.log("userFullName -->> ", userFullName);
    console.log("userFirstName -->> ", userFirstName);
    console.log("userLastName -->> ", userLastName);

    // Save userFeedback in a file in S3 with file name as paper id. Check if the file exists then append user comment else create a new file and append user comment. Save the rating also along with the comments. structure the data in such a way that it is easier to retrieve and display on UI when required
    // Check if the file exists in S3
    const params = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`, // Use the key format used during upload
    };

    let existingData = [];
    let fileExists = false;
    try {
      const data = await s3.getObject(params).promise();
      existingData = JSON.parse(data.Body.toString("utf-8"));
      console.log("existingData -->> ", existingData);
      fileExists = true;
    } catch (error) {
      // If the file doesn't exist, proceed with an empty array
      if (error.code !== "NoSuchKey") {
        console.error("Error getting existing file:", error);
        return { statusCode: 500, body: "Error getting existing file" };
      }
    }

    const currentdate = new Date().toISOString();
    const feedbackObject = {
      currentdate,
      userid,
      userFullName,
      userRating,
      userFeedback,
    };

    // Check if the user has submitted feedback earlier
    const existingFeedbackIndex = existingData.findIndex(
      (feedback) => feedback.userid === userid
    );
    if (existingFeedbackIndex !== -1) {
      // Overwrite the existing feedback
      existingData[existingFeedbackIndex] = feedbackObject;
    } else {
      // Append new feedback if no existing feedback found
      existingData.push(feedbackObject);
    }

    // Calculate overall rating and number of responses
    const numResponses = existingData.length;
    const overallRating =
      existingData.reduce((total, feedback) => total + feedback.userRating, 0) /
      numResponses;

    // Save updated data to S3
    const updatedParams = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`, // Use the key format used during upload
      Body: JSON.stringify(existingData),
      ContentType: "application/json",
    };

    if (fileExists) {
      // Update the existing file
      await s3.putObject(updatedParams).promise();
    } else {
      // Create a new file
      await s3.upload(updatedParams).promise();
    }

    // Update overall rating in submittedpapers/sp.txt file
    let paperData = [];
    try {
      const spParams = {
        Bucket: assetBucket,
        Key: `submittedpapers/sp.txt.gz`,
      };
      const data = await s3.getObject(spParams).promise();
      paperData = unzipData(data.Body.toString());
      paperData = JSON.parse(paperData);
      console.log("paperData before updating rating is -->> ", paperData);
    } catch (error) {
      console.error("Error getting submittedpapers/sp.txt.gz:", error);
      return { statusCode: 500, body: "Error getting submitted papers file" };
    }

    const paperIndex = paperData.findIndex((paper) => paper.pid === paperid);
    if (paperIndex !== -1) {
      // Update the paper's rating
      paperData[paperIndex].rating = overallRating;
      paperData[paperIndex].noofreviews = numResponses;
      console.log("paperData after updating rating is -->> ", paperData);
      const updatedSpParams = {
        Bucket: assetBucket,
        Key: `submittedpapers/sp.txt.gz`,
        Body: zipData(JSON.stringify(paperData)),
        ContentType: "application/json",
      };
      await s3.putObject(updatedSpParams).promise();
    }
    return { statusCode: 200, body: "Feedback saved successfully" };
  } catch (err) {
    console.log("Error saving feedback:", err);
    return { statusCode: 500, body: "Error saving feedback" };
  }
};

const getUserFeedback = async (request) => {
  console.log("In getUserFeedback request value is -->> ", request);
  paperid = request.pathVariables.pid;
  try {
    const params = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`,
    };

    const data = await s3.getObject(params).promise();
    console.log("data in getUserFeedback ->> ", data);
    const userFeedback = JSON.parse(data.Body.toString("utf-8"));
    console.log("userFeedback in getUserFeedback ->> ", userFeedback);
    //    return { statusCode: 200, body: userFeedback };
    // return userFeedback;
    // Remove userid field from each feedback object
    const feedbackWithoutUserId = userFeedback.map(
      ({ userid, ...rest }) => rest
    );
    console.log(
      "feedbackWithoutUserId in getUserFeedback ->> ",
      feedbackWithoutUserId
    );
    // Return the modified user feedback
    return feedbackWithoutUserId;
  } catch (err) {
    if (err.code === "NoSuchKey") {
      // console.error("User feedback not found in S3");
      // return { statusCode: 200, body: "User feedback not found" };
      console.log("File not found in S3:", err);
      return [];
    }
    console.error("Error retrieving user feedback:", err);
    return { statusCode: 500, body: "Error retrieving user feedback" };
  }
};

// Get all questions for a Exam for a paperid
const getAnswersforPaper = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getAnswersforPaper 1.0 -> paperid -->> ", paperid);
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const params = {
    TableName: paperQuestionsTable,
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

// ####### ---- Get My Result functions -->> Start ---- ############################################## //

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

// Get all questions for a Exam for a paperid
const getMyExamReview = async (request, response) => {
  console.log("Request in getMyExamReview 1.0 -> ", request);
  const paperid = request.pathVariables.pid;
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  console.log("In getMyExamReview 1.0 -> paperid -->> ", paperid);

  const params = {
    TableName: examResultsTable,
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
      TableName: examResultsHistoryTable,
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

// ####### ---- Get My Result functions -->> End ---- ############################################## //

//******************* Functions for Student -->> End ****************************************************************************/

//******************* Common Functions -->> Start ****************************************************************************/
//******************* User Profile Management **************************************/

//Get user Credits from database.
const getUserWalletBalanceChild = async (userid) => {
  const params = {
    TableName: userCreditsTable,
    Key: {
      userid: userid,
    },
    ProjectionExpression: "credits", // Specify the columns to retrieve
  };

  console.log("dynamoDB getUserWalletBalanceChild Params -> ", params);

  try {
    const data = await dynamoDBExam.get(params).promise();

    if (!data.Item) {
      console.log(
        "User not found in database. Returning null from getUserWalletBalanceChild "
      );

      return null; // If user not found, return null
    }
    console.log("data.Item.credits -->> ", data.Item.credits);

    return data.Item.credits; // Return the user credits
  } catch (err) {
    console.log("Error retrieving user credits:", err);
    throw err;
  }
};

//Update User Wallet Balance
// Update user Credits in the database.
const updateUserWalletBalance = async (userid, newBalance) => {
  const params = {
    TableName: userCreditsTable,
    Key: {
      userid: userid,
    },
    UpdateExpression: "SET credits = :newBalance",
    ExpressionAttributeValues: {
      ":newBalance": newBalance,
    },
    ReturnValues: "UPDATED_NEW", // Return the updated value of credits
  };

  console.log("dynamoDB updateUserWalletBalance Params -> ", params);

  try {
    const data = await dynamoDBExam.update(params).promise();

    if (!data.Attributes || !data.Attributes.credits) {
      console.log("Failed to update user wallet balance.");
      return null; // If update fails, return null
    }

    console.log("Updated user wallet balance:", data.Attributes.credits);
    return data.Attributes.credits; // Return the updated user credits
  } catch (err) {
    console.log("Error updating user wallet balance:", err);
    throw err;
  }
};

//Fetch User Profile for logged in user
const getMyCreditsParent = async (request, response) => {
  console.log("Inside getMyCreditsParent request 1.0 ");
  console.log("Inside getMyCreditsParent request ", request);
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);
    const userWalletBalance = await getUserWalletBalanceChild(userid);
    console.log("userWalletBalance -->> ", userWalletBalance);
    if (userWalletBalance === null) {
      console.log("User Wallet Balance is null, returing 0 ");
      return { statusCode: 200, body: JSON.stringify(0) };
    } else if (userWalletBalance !== null && userWalletBalance !== undefined) {
      console.log(
        "userWalletBalance !== null && userWalletBalance !== undefined ",
        userWalletBalance
      );
      // If user profile exists, skip record creation
      return { statusCode: 200, body: JSON.stringify(userWalletBalance) };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("Could not fetch Wallet Balance.");
      return { statusCode: 204, body: "Could not fetch Wallet Balance." };
    }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

// Function to get user profile data from the database
const getUserProfileData = async (userid) => {
  const params = {
    TableName: userProfileTable,
    Key: {
      userid: userid,
    },
    ProjectionExpression:
      "fname, lname, countrycd, usremail, countrynm, usrquali, userdesc, regastutor", // Specify the columns to retrieve
  };

  console.log("dynamoDB getUserProfile Params -> ", params);

  try {
    const data = await dynamoDBExam.get(params).promise();

    if (!data.Item) {
      return null; // If user profile not found, return null
    }

    // Transforming column names for security
    const userProfile = {
      firstname: data.Item.fname,
      lastname: data.Item.lname,
      countrycode: data.Item.countrycd,
      useremail: data.Item.usremail,
      usercountry: data.Item.countrynm,
      qualifications: data.Item.usrquali,
      briefDescription: data.Item.userdesc,
      isTutor: data.Item.regastutor,
    };

    return userProfile; // Return the transformed user profile data
  } catch (err) {
    console.log("Error retrieving user profile data:", err);
    throw err;
  }
};

// Function to get user profile image from S3
const getUserProfileImage = async (userid) => {
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `profile/${userid}`, // Use the key format used during upload
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();

    // Convert image data to base64
    const base64Image = s3Data.Body.toString("base64");
    const contentType = s3Data.ContentType || 'image/jpeg'; // Default to 'image/jpeg' if ContentType is missing
    const profileImage = `data:${contentType};base64,${base64Image}`;
    console.log("Retrieved image from S3:", profileImage);
    return profileImage;

  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("Profile image not found for user:", userid);
      // Optionally, you can set a default image or handle the absence of a profile image here
      // return ''; // Set a default image or handle the absence accordingly
      return null; // Or return null indicating absence of profile image
    } else {
      console.log("Error retrieving profile image from S3:", s3Error);
      throw s3Error;
    }
  }
};

// Fetch fetchQuestionImage for logged in user
const fetchQuestionImage = async (request, response) => {
  console.log("Inside fetchQuestionImage request 1.0 ");
  console.log("Inside fetchQuestionImage request ", request);
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);
    const paperid = request.pathVariables.pid;
    const questionid = request.pathVariables.qid;

    // Get user profile data from the database
    const questionsImage = await getQuestionImage(paperid, questionid);
    return { statusCode: 200, body: JSON.stringify(questionsImage) };

  } catch (err) {
    console.log("Error fetching user profile:", err);
    return { statusCode: 500, body: "Error fetching user profile" };
  }
};

// Function to get user profile image from S3
const getQuestionImage = async (paperid, questionid) => {
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `questionsimages/${paperid}/${questionid}.jpg` // Use the key format used during upload
  };

  try {
    const s3ImageData = await s3.getObject(s3Params).promise();
    
    // Convert the text file data to a string and parse it as JSON
    const questionsimage = s3ImageData.Body.toString("utf-8");
    return questionsimage;

    // // Convert image data to base64
    // const questionsimage = s3ImageData.Body.toString("base64");
    // return questionsimage;
  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("image not found for question:");
      // Optionally, you can set a default image or handle the absence of a profile image here
      // return ''; // Set a default image or handle the absence accordingly
      return null; // Or return null indicating absence of profile image
    } else {
      console.log("Error retrieving profile image from S3:", s3Error);
      throw s3Error;
    }
  }
};

// Fetch User Profile for logged in user
const fetchUserProfile = async (request, response) => {
  console.log("Inside fetchUserProfile request 1.0 ");
  console.log("Inside fetchUserProfile request ", request);
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);

    // Get user profile data from the database
    const existingUserProfileData = await getUserProfileData(userid);

    if (existingUserProfileData) {
      // If user profile exists, fetch profile image from S3
      const profileImage = await getUserProfileImage(userid);

      // Add profile image to the user profile data
      existingUserProfileData.profileImage = profileImage;
      console.log("existingUserProfileData -->> ", existingUserProfileData);
      return { statusCode: 200, body: JSON.stringify(existingUserProfileData) };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist.");
      return { statusCode: 204, body: "User profile does not exist" };
    }
  } catch (err) {
    console.log("Error fetching user profile:", err);
    return { statusCode: 500, body: "Error fetching user profile" };
  }
};

//Create User Profile
const createUserProfileChild = async (userid, record) => {
  console.log("Inside createUserProfileChild request 1.0 ");
  console.log("Inside createUserProfileChild record ", record);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    console.log("request userid is -->> ", userid);
    console.log("request email is -->> ", record.useremail);
    console.log("request name is -->> ", record.firstname);
    console.log("request name is -->> ", record.lastname);
    //    const today = new Date();
    const currentdate = new Date().toISOString();
    const params = {
      TableName: userProfileTable,
      Item: {
        userid: userid,
        fname: "",
        lname: "",
        usremail: record.useremail,
        address: "",
        city: "",
        zipcode: "",
        countrycd: "",
        countrynm: "",
        crtdt: currentdate,
        updatedt: "",
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB createUserProfileChild Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "User profile updated successfully." };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Create User Profile
const createUserProfile = async (request, response) => {
  console.log("Inside createUserProfile request 1.0 ");
  console.log("Inside createUserProfile request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);
    const existingUserProfile = await getUserProfileData(userid);

    if (existingUserProfile) {
      // If user profile exists, skip record creation
      return { statusCode: 200, body: "User profile already exists" };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist. Creating new profile.");

      // Use createUserProfile function to create a new profile
      const createResult = await createUserProfileChild(userid, record);
      //        return createResult;

      /* 
            // This code is working. Uncomment this to get the user added to a specific userPoolID in a particular group
             // Add user to Cognito user group after profile creation
             try {
              console.log("userPoolID in QuestionServices Lambda is -->> ", userPoolID);
              const params = {
                GroupName: 'student', // Making the user a member of this default group
                UserPoolId: userPoolID, //use the userpool ID from the lambda emvironment
                Username: userid,
              };
              await cognitoISP.adminAddUserToGroup(params).promise();
              console.log(`User ${userid} added to group: ${params.GroupName}`);
            } catch (error) {
              console.error('Error adding user to group:', error);
              // Handle error appropriately
            }
      */
      return { statusCode: 200, body: "User Profile created successfully." };
    }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Update User Profile image
const updateUserProfileImage = async (request, response) => {
  console.log("Inside updateUserProfileImage request 1.0 ");
  console.log("Inside updateUserProfileImage request ", request);

  try {
    const formData = JSON.parse(request.event.body);
    // const formData = request.event.body;
    if (!formData) {
      return { statusCode: 400, body: "No data provided" };
    }
     const userid = request.event.requestContext.authorizer.jwt.claims.username;

    let s3ImagePath = ""; // Declare s3ImagePath variable outside the conditional block

    // Check if the formData has data
    if (formData) {

      const imageData = formData.profileImage;
      const [prefix, base64Image] = imageData.split(',');
      const buffer = Buffer.from(base64Image, "base64");
      const contentType = prefix.split(':')[1].split(';')[0];
      console.log("imageData -->> ", imageData);
      console.log("contentType -->> ", contentType);
      // Assuming record contains raw image data
      //      const buffer = Buffer.from(formData);
      // const buffer = Buffer.from(formData.profileImage, "base64"); // Assuming record contains base64 encoded data

      // Upload the image to S3
      const params = {
        Bucket: assetBucket, // Replace with your actual bucket name
        Key: `profile/${userid}`, // Store in the 'profile' folder with the userid as the filename
        Body: buffer,
        ACL: "private", // Set appropriate permissions to restrict access to the uploaded image
        ContentType: contentType, // Change content type according to your image type
      };

      // Upload image to S3
      const uploadResult = await s3.upload(params).promise();
      console.log("Uploaded image to S3:", uploadResult.Location);

      // Get the S3 path of the uploaded image
      s3ImagePath = uploadResult.Location;

      console.log("S3 image path:", s3ImagePath);
      return { statusCode: 200, body: "Profile image uploaded successfully" };
    } else {
      // Return error if no record or profile image is found
      console.log("No user profile image provided.");
      return { statusCode: 400, body: "No user profile image provided" };
    }
  } catch (err) {
    // Catch any exceptions during the process
    console.log("Error updating profile image:", err);
    return { statusCode: 500, body: "Error updating profile image" };
  }
};

const deleteUserProfileImage = async (request, response) => {
  console.log("In deleteUserProfileImage -->> ");
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  const s3Params = {
    Bucket: process.env.ASSET_BUCKET, // Use the environment variable for the bucket name
    Key: `profile/${userid}`, // Use the key format used during upload
  };

  try {
    console.log("deleteUserProfileImage s3Params -->> ", s3Params);
    await s3.deleteObject(s3Params).promise();
    console.log("Deleted profile image from S3 for user:", userid);
    return { statusCode: 200, body: "Profile image deleted successfully" };
  } catch (s3Error) {
    console.log("Error deleting profile image from S3:", s3Error);
    if (s3Error.code === 'NoSuchKey') {
      console.log(`No profile image found for user ${userid}`);
      return { statusCode: 404, body: "Profile image not found" };
    } else if (s3Error.code === 'ValidationException') {
      console.log("ValidationException: Check bucket name and key format");
      return { statusCode: 400, body: "Invalid bucket name or key format" };
    } else {
      return { statusCode: 500, body: "Error deleting profile image" };
    }
  }
};


//Update User Profile
const updateUserProfile = async (request, response) => {
  console.log("Inside updateUserProfile request 1.0 ");
  console.log("Inside updateUserProfile request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const existingUserProfile = await getUserProfileData(userid);
   
    const s3ImagePath = assetBucket + `/profile/${userid}`;
    //Update the userProfile data
    if (existingUserProfile) {
      // If user profile exists, update the record
      const currentdate = new Date().toISOString();

      // Mapping updated attributes back to original column names
      const updatedProfile = {
        fname: record.firstname || existingUserProfile.firstname || "", // Use '' if no value provided
        lname: record.lastname || existingUserProfile.lastname || "", // Use '' if no value provided
        countrycd: record.countrycode || existingUserProfile.countrycode || "", // Use '' if no value provided
        countrynm: record.countryname || existingUserProfile.countryname || "", // Use '' if no value provided
        updatedt: currentdate,
        profileimage: s3ImagePath || "", // Use '' if no value provided, // Add the S3 image path to the profile
        usrquali: record.qualifications || "",
        userdesc: record.briefDescription || "",
        regastutor: record.isTutor || "",
      };
      // Update the profile in the database with S3 image path
      const paramsForUpdate = {
        TableName: userProfileTable,
        Key: {
          userid: userid,
        },
        UpdateExpression:
          "SET fname = :fnameVal, lname = :lnameVal, countrycd = :countrycdVal, countrynm = :countrynmVal, updatedt = :updatedtVal, profileimage = :profileImageVal, usrquali = :usrqualiVal, userdesc = :userdescVal, regastutor = :regastutorVal",
        ExpressionAttributeValues: {
          ":fnameVal": updatedProfile.fname,
          ":lnameVal": updatedProfile.lname,
          ":countrycdVal": updatedProfile.countrycd,
          ":countrynmVal": updatedProfile.countrynm,
          ":updatedtVal": updatedProfile.updatedt,
          ":profileImageVal": updatedProfile.profileimage,
          ":usrqualiVal": updatedProfile.usrquali,
          ":userdescVal": updatedProfile.userdesc,
          ":regastutorVal": updatedProfile.regastutor,
        },
      };

      // Update user profile table with the S3 image path
      console.log("dynamoDB updateUserProfile Params -> ", paramsForUpdate);
      await dynamoDBExam.update(paramsForUpdate).promise();

      return { statusCode: 200, body: "Data updated successfully." };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist. Creating new profile.");

      // // Use createUserProfile function to create a new profile
      // const createResult = await createUserProfile(userid, record);
      // return createResult;
      return {
        statusCode: 400,
        body: "User profile does not exist, update profile failed",
      };
    }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

// //Get top 10 papers based on top ratings
// const getTopTenPapers = async (request, response) => {

//   const result = await getTopTenPapersFromSubmittedPaperTab();
//   return result;
// };

//Get top 10 papers based on top ratings
const getTopTenPackagesFromS3 = async (request, response) => {
  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `packages/package.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    return unzippedData;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get top 10 papers based on top ratings
const getpackpapdtls = async (request, response) => {
  console.log("In getpackpapdtls 1.0");
  console.log("In getpackpapdtls request ", request);
  jsonRequestBody = JSON.parse(request.event.body);
  paperids = jsonRequestBody.paperids;
  console.log("paperids -->> ", paperids);
  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    const allPapers = JSON.parse(unzippedData);
    console.log("allPapers -->> ", allPapers);
    const filteredPapers = allPapers.filter(paper => paperids.includes(paper.pid));
    console.log("filteredPapers -->> ", filteredPapers);
    return {
      statusCode: 200,
      body: JSON.stringify(filteredPapers),
    };

  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get top 10 papers based on top ratings
const getTopTenPapersFromS3 = async (request, response) => {
  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    return unzippedData;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get top 10 papers based on top ratings
const getTopTenPapers = async (request, response) => {
  try {
    const result = await getTopTenPapersFromSubmittedPaperTab();

    if (result && result.length > 0) {
      return result;
    } else {
      return { statusCode: 200, body: "No papers are published yet" };
    }
  } catch (error) {
    console.error("Error fetching top ten papers:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};

const obfuscateColumnNamesTopTenPapers = (data) => {
  const obfuscatedKeys = {
    paperid: "pid",
    examtitle: "papertitle",
    examdesc: "paperdesc",
    paperrating: "rating",
    paperprice: "price",
    cat: "category",
    subcat: "subcategory",
    difflvl: "difflvl",
    subcatl2: "subcategorylvl2",
    reviewcount: "noofreviews",
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

//Get top 10 papers based on top ratings
const getTopTenPapersFromSubmittedPaperTab = async () => {
  try {
    const params = {
      TableName: submittedPapersTable,
      IndexName: `${tableNamePrefix}_GSI1`,
      KeyConditionExpression:
        "#rating >= :rating AND #dummycolumn = :dummycolumn",
      ExpressionAttributeNames: {
        "#rating": "paperrating",
        "#dummycolumn": "dummycolumn",
      },
      ExpressionAttributeValues: {
        ":rating": 0,
        ":dummycolumn": 1,
        ":published": 1, // Condition to check if the paper is published. published=1 means the paper is published
      },
      FilterExpression: "published = :published",
      ProjectionExpression:
        "paperid, examtitle, examdesc, paperrating, noofreviews, paperprice, cat, subcat, difflvl, subcatl2",
      Limit: 10,
      ScanIndexForward: false, //By default, the sort order is ascending. To reverse the order, set the ScanIndexForward parameter to false
    };

    const result = await dynamoDBExam.query(params).promise();
    if (result.Items && result.Items.length > 0) {
      // Obfuscate column names before sending to frontend
      const obfuscatedResults = result.Items.map((item) =>
        obfuscateColumnNamesTopTenPapers(item)
      );
      console.log("obfuscatedResults -> ", obfuscatedResults);
      return obfuscatedResults;
    } else {
      return []; // Return an empty array when no records are found
    }

    //return result.Items;
  } catch (err) {
    console.error("CME GTTP01 - Error getting submitted papers for user", err);
    throw err;
  }
};

//Get exams based on the search criteria
const searchExam = async (request, response) => {
  console.log("In searchExam request -->> ", request);
  console.log("In searchExam request -->> ", request.event.body);
  const requestBody = JSON.parse(request.event.body);
  console.log("In searchExam request -->> ", requestBody.searchText);
  // const result = await searchExamQuery(requestBody);
  //  const result = await linearSearchFromFile(requestBody);
  //  const result = await searchInMultipleStringsFromFile(requestBody);
  const result = await searchInMultipleStrandSort(requestBody);
  return result;
};

const searchInMultipleStrandSort = async (requestBody) => {
  const searchText = requestBody.searchText;
  const searchWords = searchText.toLowerCase().split(/\s+/);

  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    const searchData = JSON.parse(unzippedData);

    // Perform a search using filter on multiple fields and any of the words
    const searchResults = searchData.map((paper) => {
      const lowerCasePaperDesc = paper.paperdesc.toLowerCase();
      const lowerCasePaperTitle = paper.papertitle.toLowerCase();
      const lowerCaseCategory = paper.category.toLowerCase();
      const lowerCaseSubcategory = paper.subcategory.toLowerCase();
      const lowerCaseSubcategoryLvl2 = paper.subcategorylvl2.toLowerCase();
      const lowerCaseFirstName = paper.firstname.toLowerCase();
      const lowerCaseLastName = paper.lastname.toLowerCase();

      // Count the number of matching words
      const matchingWordsCount = searchWords.reduce(
        (count, word) =>
          count +
          (lowerCasePaperDesc.includes(word) ||
            lowerCasePaperTitle.includes(word) ||
            lowerCaseCategory.includes(word) ||
            lowerCaseSubcategory.includes(word) ||
            lowerCaseSubcategoryLvl2.includes(word) ||
            lowerCaseFirstName.includes(word) ||
            lowerCaseLastName.includes(word)
            ? 1
            : 0),
        0
      );

      return {
        ...paper,
        matchingWordsCount,
      };
    });

    // Sort the search results based on the number of matching words and then by rating
    searchResults.sort((a, b) => {
      if (b.matchingWordsCount !== a.matchingWordsCount) {
        return b.matchingWordsCount - a.matchingWordsCount;
      }
      // If word count is the same, prioritize higher rating
      return b.rating - a.rating;
    });

    // Remove the temporary 'matchingWordsCount' property from the final results
    const finalResults = searchResults.map(
      ({ matchingWordsCount, ...rest }) => rest
    );

    return finalResults;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get exams based on the search criteria
const searchPacks = async (request, response) => {
  console.log("In searchPacks request 1 -->> ", request);
  console.log("In searchPacks request 2 -->> ", request.event.body);
  const requestBody = JSON.parse(request.event.body);
  console.log("In searchPacks request 3 -->> ", requestBody.searchText);
  // const result = await searchExamQuery(requestBody);
  //  const result = await linearSearchFromFile(requestBody);
  //  const result = await searchInMultipleStringsFromFile(requestBody);
  const result = await searchInMultiplePackFields(requestBody);
  return result;
};

const searchInMultiplePackFields = async (requestBody) => {
  console.log("In searchInMultiplePackFields request 1 -->> ", requestBody);
  console.log("In searchInMultiplePackFields request 2 -->> ", requestBody.searchText);
  const searchText = requestBody.searchText;
  console.log("In searchInMultiplePackFields request 3 -->> ", searchText);
  const searchWords = searchText.toLowerCase().split(/\s+/);

  // Fetch submitted packages from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `packages/package.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    const searchData = JSON.parse(unzippedData);

    // Perform a search using filter on multiple fields and any of the words
    const searchResults = searchData.map((pack) => {
      const lowerCasePackDesc = pack.packDesc.toLowerCase();
      const lowerCasePackTitle = pack.packTitle.toLowerCase();

      // Count the number of matching words
      const matchingWordsCount = searchWords.reduce(
        (count, word) =>
          count +
          (lowerCasePackDesc.includes(word) ||
            lowerCasePackTitle.includes(word)
            ? 1
            : 0),
        0
      );

      return {
        ...pack,
        matchingWordsCount,
      };
    });

    // Sort the search results based on the number of matching words and then by pack rating
    searchResults.sort((a, b) => {
      if (b.matchingWordsCount !== a.matchingWordsCount) {
        return b.matchingWordsCount - a.matchingWordsCount;
      }
      // If word count is the same, prioritize higher pack rating
      return b.packrating - a.packrating;
    });

    // Remove the temporary 'matchingWordsCount' property from the final results
    const finalResults = searchResults.map(
      ({ matchingWordsCount, ...rest }) => rest
    );

    return finalResults;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};


//This search will search for words and their combination in different strings. The searchResults filter condition is updated to check if every word is present in any of the specified fields.
const searchInMultipleStringsFromFile = async (requestBody) => {
  const searchText = requestBody.searchText;
  const searchWords = searchText.toLowerCase().split(/\s+/); // Split search text into words
  console.log("In searchFromFile searchText is -->> ", searchText);
  // Fetch user profile image from S3
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `submittedpapers/sp.txt`, // Use the key format used during upload
  };
  console.log("In searchFromFile s3Params is -->> ", s3Params);
  try {
    const s3Data = await s3.getObject(s3Params).promise();
    const searchData = JSON.parse(s3Data.Body.toString());
    console.log("In searchFromFile searchData is -->> ", searchData);
    const lowerCaseSearchText = searchText.toLowerCase();
    console.log(
      "In searchFromFile lowerCaseSearchText is -->> ",
      lowerCaseSearchText
    );
    const sortBy = "qcount";
    // // Perform a simple search using filter
    // const searchResults = searchData.filter(paper => paper.paperdesc.toLowerCase().includes(lowerCaseSearchText));
    // Perform a search using filter on multiple fields and multiple words
    const searchResults = searchData.filter((paper) => {
      const lowerCasePaperDesc = paper.paperdesc.toLowerCase();
      const lowerCasePaperTitle = paper.papertitle.toLowerCase();
      const lowerCaseCategory = paper.category.toLowerCase();
      const lowerCaseSubcategory = paper.subcategory.toLowerCase();
      const lowerCaseSubcategoryLvl2 = paper.subcategorylvl2.toLowerCase();

      // Check if any of the search words are present in the specified fields
      return searchWords.every(
        (word) =>
          lowerCasePaperDesc.includes(word) ||
          lowerCasePaperTitle.includes(word) ||
          lowerCaseCategory.includes(word) ||
          lowerCaseSubcategory.includes(word) ||
          lowerCaseSubcategoryLvl2.includes(word)
      );
    });

    console.log("In searchFromFile searchResults is -->> ", searchResults);
    // Sort the search results based on a specified key (sortBy)
    if (sortBy) {
      searchResults.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }
    console.log("In searchFromFile searchResults is -->> ", searchResults);
    return searchResults;
  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
      // Optionally, you can set a default image or handle the absence of a profile image here
      // userProfile.profileImage = ''; // Set a default image or handle the absence accordingly
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//This search will search the single work or words coming together but will not give result if a combination of words are searched which appear at different places.
const linearSearchFromFile = async (requestBody) => {
  const searchText = requestBody.searchText;
  console.log("In searchFromFile searchText is -->> ", searchText);
  // Fetch user profile image from S3
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `submittedpapers/sp.txt`, // Use the key format used during upload
  };
  console.log("In searchFromFile s3Params is -->> ", s3Params);
  try {
    const s3Data = await s3.getObject(s3Params).promise();
    const searchData = JSON.parse(s3Data.Body.toString());
    console.log("In searchFromFile searchData is -->> ", searchData);
    const lowerCaseSearchText = searchText.toLowerCase();
    console.log(
      "In searchFromFile lowerCaseSearchText is -->> ",
      lowerCaseSearchText
    );
    const sortBy = "qcount";
    // // Perform a simple search using filter
    // const searchResults = searchData.filter(paper => paper.paperdesc.toLowerCase().includes(lowerCaseSearchText));
    // Perform a search using filter on multiple fields
    const searchResults = searchData.filter(
      (paper) =>
        paper.paperdesc.toLowerCase().includes(lowerCaseSearchText) ||
        paper.papertitle.toLowerCase().includes(lowerCaseSearchText) ||
        paper.category.toLowerCase().includes(lowerCaseSearchText) ||
        paper.subcategory.toLowerCase().includes(lowerCaseSearchText) ||
        paper.subcategorylvl2.toLowerCase().includes(lowerCaseSearchText)
      // Add more fields as needed
    );

    console.log("In searchFromFile searchResults is -->> ", searchResults);
    // Sort the search results based on a specified key (sortBy)
    if (sortBy) {
      searchResults.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }
    console.log("In searchFromFile searchResults is -->> ", searchResults);
    return searchResults;
  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
      // Optionally, you can set a default image or handle the absence of a profile image here
      // userProfile.profileImage = ''; // Set a default image or handle the absence accordingly
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};

//Get exams based on the search criteria
const searchExamQuery = async (requestBody) => {
  try {
    const params = {
      TableName: submittedPapersTable,
      IndexName: `${tableNamePrefix}_GSI1`,
      //      KeyConditionExpression: "#dummycolumn = :dummycolumn AND #rating >= :rating AND begins_with(#examtitle, :examtitle)",
      KeyConditionExpression:
        "#dummycolumn = :dummycolumn AND #rating >= :rating",
      ExpressionAttributeNames: {
        "#dummycolumn": "dummycolumn",
        "#rating": "paperrating",
        "#examtitle": "examtitle",
      },
      ExpressionAttributeValues: {
        //        ":examtitle": requestBody.searchText.toLowerCase(),
        ":examtitle": requestBody.searchText,
        ":rating": 0,
        ":dummycolumn": 1,
        ":published": 1,
      },
      FilterExpression:
        "begins_with(#examtitle, :examtitle) AND published = :published",
      ProjectionExpression:
        "paperid, examtitle, examdesc, paperrating, noofreviews, paperprice",
      Limit: 10,
      //      ScanIndexForward: false, //By default, the sort order is ascending. To reverse the order, set the ScanIndexForward parameter to false
    };

    const result = await dynamoDBExam.query(params).promise();
    return result.Items;
  } catch (err) {
    console.error("Error getting search results", err);
    throw err;
  }
};

// Update the cache every 10080 minutes (10080 minutes equates to 7 days)
//setInterval(updateTopTenPaperCache, 10080 * 60 * 1000);

//updateTopTenPaperCache Table
const updateTopTenPaperCache = async (request, response) => {
  try {
    const result = await getTopTenPapersFromSubmittedPaperTab();
    //    const result = await dynamoDBExam.query(params).promise();
    console.log("Top10Paper result -->>", result);
    const items = result;
    const putRequests = items.map((item) => {
      return {
        PutRequest: {
          Item: {
            paperid: item.paperid,
            paperrating: item.paperrating,
            examdesc: item.examdesc,
            paperprice: item.paperprice,
            examtitle: item.examtitle,
          },
        },
      };
    });
    const params = {
      RequestItems: {
        [topRatedPapers]: putRequests,
      },
    };
    console.log("Top10Paper params -->>", params);
    console.log(
      "Top10Paper JSON.stringify(params) -->>",
      JSON.stringify(params)
    );
    await dynamoDBExam.batchWrite(params).promise();
    console.log("Cache updated successfully");
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};

// Save ContactUsMessages
const contactUsMsgs = async (request, response) => {
  console.log("Inside contactUsMsgs request ", request);
  const contactMsg = JSON.parse(request.event.body);
  console.log("Inside contactUsMsgs contactMsg ", contactMsg);

  if (!contactMsg) {
    console.log("Incomplete message");
    return {
      statusCode: 400,
      body: "Incomplete message",
    };
  }
  const contactname = contactMsg.contactusrecord.name;
  const contactemail = contactMsg.contactusrecord.email;
  const contactmessage = contactMsg.contactusrecord.message;
  
  const currentDate = new Date();
  // Format the date directly without converting to ISO
  const currentMMYYYY = currentDate.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "numeric",
  });

  console.log(currentMMYYYY);

  const getcontactMgsparams = {
    Bucket: assetBucket,
    Key: `contactmessages/${currentMMYYYY}`, // Use the key format used during upload
  };

  // Retrieve existing papers data from S3
  let existingMsgData = "";
  let msgDatafileExists = false;
  try {
    const data = await s3.getObject(getcontactMgsparams).promise();
    console.log("Raw Data as retrieved from S3", data);
    existingMsgData = unzipData(data.Body.toString()); // Unzip the data
    console.log("Existing Messages:", existingMsgData);
    msgDatafileExists = true;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code !== "NoSuchKey") {
      console.error("Error getting existing file:", error);
      return { statusCode: 500, body: "Error getting papers file" };
    }
  }

  // Append the new paper
  let updatedContactArray = existingMsgData ? JSON.parse(existingMsgData) : [];
  console.log("Existing Data:", existingMsgData);
  updatedContactArray.push(contactMsg);
  console.log("Updated Data:", updatedContactArray);
  console.log(
    "JSON.stringify(updatedContactArray) -->> ",
    JSON.stringify(updatedContactArray)
  );

  // Creating a new file for exam with the file names as paperid
  const contactMsgparams = {
    Bucket: assetBucket,
    Key: `contactmessages/${currentMMYYYY}`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedContactArray)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  try {
    await s3.upload(contactMsgparams).promise();
    return { statusCode: 200, body: "Contact message saved successfully" };
  } catch (err) {
    console.error("Error updating message:", err);
    return { statusCode: 500, body: "Error updating message" };
  }
};

// Razorpay createOrder API
const razorpayCreateOrder = async (request, response) => {
  console.log("Inside createOrder request ", request);
  const requestBody = JSON.parse(request.event.body);
  console.log("Inside createOrder requestBody ", requestBody);
  const paymentData = JSON.parse(requestBody.paymentdata);
  const amount = paymentData.amount;
  console.log("Inside createOrder amount ", amount);

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid payment amount" }),
    };
}

  try {
      const order = await razorpay.orders.create({
          amount: amount, // Amount in paise
          currency: "INR",
          receipt: "receipt_" + Math.random().toString(36).substring(7),
      });
      console.log("Razorpay order created:", order);
       // Construct options object
      const options = {
        key: razorPayKeyId, // Fetch the key from environment variables
        amount: order.amount,
        currency: order.currency,
        name: "ExamsAreFun",
        description: "Course Purchase",
        order_id: order.id,
        prefill: {
          name: paymentData.customerName || "Customer Name",
          email: paymentData.customerEmail || "customer@example.com",
          contact: paymentData.customerContact || "9876543210",
        },
        theme: {
          color: "#3399cc",
        },
      };
      
      return {
        statusCode: 200,
//        body: JSON.stringify(order),
        body: JSON.stringify({ order, options }),
    };
  } catch (error) {
//    console.log("Error creating Razorpay order:", error);
    console.error("Error creating Razorpay order:", {
      message: error.message,
      stack: error.stack,
      raw: error,
  });
  
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create Razorpay order" }),
  };
  }
};



// Helper function to generate the X-VERIFY header
const generatePhonePeSignature = (base64Payload, endpointPath, saltKey) => {
  try {
    console.log("Inside generatePhonePeSignature phonepeKeyIndex ", phonepeKeyIndex);
    console.log("Inside generatePhonePeSignature saltKey ", saltKey);
    console.log("Inside generatePhonePeSignature endpointPath ", endpointPath);
    console.log("Inside generatePhonePeSignature phonepeUrl ", phonepeUrl);
    console.log("Inside generatePhonePeSignature phonepeMerchantId ", phonepeMerchantId);
    console.log("Inside generatePhonePeSignature phonepeKeySecret ", phonepeKeySecret);
    console.log("Inside generatePhonePeSignature payload ", base64Payload);
//    const base64Payload = Buffer.from(base64Payload).toString("base64"); // Encode payload to base64
    const rawData = base64Payload + endpointPath + saltKey; // Concatenate payload, endpoint, and salt
    console.log("Inside generatePhonePeSignature rawData ", rawData);
    const hash = crypto.createHash("sha256").update(rawData).digest("hex"); // Compute SHA-256 hash
    console.log("Inside generatePhonePeSignature hash ", hash);
    const saltIndex = phonepeKeyIndex; // Replace with your actual salt index
    console.log("Inside generatePhonePeSignature saltIndex ", saltIndex);
    return hash + "###" + saltIndex; // Append salt index
  } catch (error) {
    console.error("Error generating X-VERIFY signature:", error);
    throw error;
  }
};

// PhonePe createOrder API
const phonepeCreateOrder = async (request, response) => {
  console.log("[phonepeCreateOrder] request ", request);
  const requestBody = JSON.parse(request.event.body);
  console.log("[phonepeCreateOrder] requestBody ", requestBody);
  const paymentData = JSON.parse(requestBody.paymentdata);
  const amount = paymentData.amount;
  console.log("[phonepeCreateOrder] amount ", amount);

  try {
      // Prepare data for PhonePe order API
      const requestPayload = {
          merchantId: phonepeMerchantId, //"YOUR_PHONEPE_MERCHANT_ID",
          merchantUserId: phonepeMerchantUserId,
          merchantTransactionId: "txn_" + Math.random().toString(36).substring(7),
          amount: amount, // Amount in paise
          redirectMode: "POST",
//          currency: "INR",
          redirectUrl: "https://www.examsarefun.com/callback", // Replace with your redirect URL
          callbackUrl: "https://www.examsarefun.com/callback", // Replace with your callback URL
          paymentInstrument: {
            type: "PAY_PAGE",
          }
      };
      const jsonRequestPayload = JSON.stringify(requestPayload);
      console.log("[phonepeCreateOrder] PhonePe request jsonRequestPayload -->>", jsonRequestPayload);

      const base64Payload = Buffer.from(jsonRequestPayload).toString("base64");
      console.log("[phonepeCreateOrder] base64PayLoad -->> ", base64Payload);
      
      const endpointPath="/pg/v1/pay";
      // Generate X-VERIFY signature
      const rawData = base64Payload + endpointPath + phonepeKeySecret; // Concatenate payload, endpoint, and salt
      console.log("[phonepeCreateOrder] rawData ", rawData);
      const hash = crypto.createHash("sha256").update(rawData).digest("hex"); // Compute SHA-256 hash
      console.log("[phonepeCreateOrder] hash ", hash);
//      const saltIndex = phonepeKeyIndex; // Replace with your actual salt index
      console.log("[phonepeCreateOrder] saltIndex ", phonepeKeyIndex);
      xVerifyHeader = hash + "###" + phonepeKeyIndex; // Append salt index

      // const xVerifyHeader = generatePhonePeSignature(
      //   base64Payload, 
      //   endpointPath, 
      //   phonepeKeySecret
      // );
      console.log("[phonepeCreateOrder] X-VERIFY header:", xVerifyHeader);

      const apiCallURL =  phonepeUrl+"/pg/v1/pay";
      console.log("PhonePe API call URL:", apiCallURL);

      const options = {
        method: 'POST',
        headers: {
          // accept: 'text/plain',
          'Content-Type' : 'application/json',
          "X-VERIFY": xVerifyHeader, // Pass the generated signature here
          },
 //         body: JSON.stringify(base64Payload),
          body: JSON.stringify({ request: base64Payload }),

        };
      console.log("PhonePe options:", options);

      // // Call PhonePe API for creating the order
      // const orderResponse = await fetch(apiCallURL, {
      //   method: "POST",
      //   headers: {
      //       "Content-Type": "application/json",
      //       "X-VERIFY": xVerifyHeader, // Pass the generated signature here
      //   },
      //   body: base64Payload,
      // });
      const orderResponse = await fetch(apiCallURL, options)
      console.log("PhonePe order response:", orderResponse);

      const orderData = await orderResponse.json(); // Properly parse the response
      console.log("PhonePe order created:", orderData);
      
      // let orderData;
      // try {
      //     orderData = await orderResponse.json();
      // } catch (err) {
      //     orderData = await orderResponse.text(); // Fallback to text if JSON parsing fails
      //     console.log("Non-JSON response from PhonePe:", orderData);
      // }
      // console.log("PhonePe order created:", orderData);

      if (orderResponse.status === 200 && orderData.success) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                paymentUrl: orderData.data.instrumentResponse.redirectInfo.url, // Extract actual payment URL
            }),
        };
    } else {
          throw new Error("Failed to create PhonePe order.");
      }
  } catch (error) {
      console.log("Error creating PhonePe order:", error);
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to create PhonePe order." }),
      };
  }
};

class PaymentService {
  constructor(userId, amount) {
    this.userId = userId;
    this.amount = amount;
  }
  async processPayment() {
    throw new Error("processPayment() must be implemented.");
  }
}

class WalletPayment extends PaymentService {
  constructor(userId, amount) {
    super(userId, amount);
  }

  async processPayment() {
    console.log("[WalletPayment] processPayment amount ", this.amount);
    console.log("[WalletPayment] processPayment userId ", this.userId);
    const userWalletBalance = await getUserWalletBalanceChild(this.userId);
    console.log("[WalletPayment] userWalletBalance ", userWalletBalance);
    
    if (userWalletBalance === null || userWalletBalance === undefined) {
      return { statusCode: 204, body: "Could not fetch Wallet Balance." };
    }

    if (this.amount > userWalletBalance) {
      return { statusCode: 200, body: "Wallet balance is not sufficient." };
    }

    const newWalletBalance = userWalletBalance - this.amount;
    console.log("[WalletPayment] newWalletBalance ", newWalletBalance);
    await updateUserWalletBalance(this.userId, newWalletBalance);

    return { statusCode: 200, body: "Wallet payment successful." };
  }
}

class RazorpayPayment extends PaymentService {
  constructor(userId, amount, paymentData) {
    super(userId, amount);
    this.paymentData = paymentData;
  }

  async processPayment() {
    try {
      console.log("[RazorpayPayment] processPayment amount ", this.amount);
      console.log("[RazorpayPayment] processPayment userId ", this.userId);
      const order = await razorpay.orders.create({
        amount: this.amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      console.log("[RazorpayPayment] processPayment order ", order);

      return {
        statusCode: 200,
        body: JSON.stringify({ order, options: this.getPaymentOptions(order) }),
      };
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create Razorpay order" }) };
    }
  }

  getPaymentOptions(order) {
    return {
      key: razorPayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: "ExamsAreFun",
      description: "Course Purchase",
      order_id: order.id,
      prefill: {
        name: this.paymentData.customerName || "Customer Name",
        email: this.paymentData.customerEmail || "customer@example.com",
        contact: this.paymentData.customerContact || "9876543210",
      },
      theme: { color: "#3399cc" },
    };
  }
}

class PhonePePayment extends PaymentService {
  constructor(userId, amount) {
    super(userId, amount);
  }

  async processPayment() {
    try {
      console.log("[PhonePePayment] processPayment amount ", this.amount);
      console.log("[PhonePePayment] processPayment userId ", this.userId);
      const requestPayload = {
        merchantId: phonepeMerchantId,
        merchantUserId: phonepeMerchantUserId,
        merchantTransactionId: `txn_${Date.now()}`,
        amount: this.amount,
        redirectMode: "POST",
        redirectUrl: "https://www.examsarefun.com/mylearnings",
        callbackUrl: "https://www.examsarefun.com/mylearnings",
        paymentInstrument: { type: "PAY_PAGE" },
      };
      console.log("[PhonePePayment] processPayment requestPayload ", requestPayload);

      const base64Payload = Buffer.from(JSON.stringify(requestPayload)).toString("base64");
      const rawData = base64Payload + "/pg/v1/pay" + phonepeKeySecret;
      const hash = crypto.createHash("sha256").update(rawData).digest("hex");
      const xVerifyHeader = hash + "###" + phonepeKeyIndex;

      const response = await fetch(phonepeUrl + "/pg/v1/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-VERIFY": xVerifyHeader },
        body: JSON.stringify({ request: base64Payload }),
      });
      console.log("[PhonePePayment] processPayment response ", response);

      const orderData = await response.json();
      console.log("[PhonePePayment] processPayment orderData ", orderData);
      if (response.status === 200 && orderData.success) {
        return { statusCode: 200, body: JSON.stringify({ paymentUrl: orderData.data.instrumentResponse.redirectInfo.url }) };
      } else {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to create PhonePe order" }) };
      }
    } catch (error) {
      console.error("Error creating PhonePe order:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create PhonePe order" }) };
    }
  }
}

class PaymentFactory {
  static createPayment(paymentMethod, userId, amount, paymentData = null) {
    switch (paymentMethod) {
      case "wallet":
        return new WalletPayment(userId, amount);
      case "razorpay":
        return new RazorpayPayment(userId, amount*100, paymentData);
      case "phonepe":
        return new PhonePePayment(userId, amount*100);
      default:
        throw new Error("Invalid payment method");
    }
  }
}

//Verifies the payment by checking the Razorpay signature and payment status.
const verifyPayment = async (paymentId, orderId, razorpaySignature) => {
  try {
    // Step 1: Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(paymentId);
    console.log("[verifyPayment] Payment Details: ", paymentDetails);

    // Step 2: Check if payment is captured
    if (paymentDetails.status !== "captured" || paymentDetails.order_id !== orderId) {
      return { 
        success: false, 
        message: "Payment verification failed (status/order mismatch).",
        paymentDetails // Include payment details for debugging/logging
      };
    }

    // Step 3: Verify the Razorpay signature for security
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", razorPayKeySecret)
      .update(body)
      .digest("hex");

    console.log("[verifyPayment] Expected Signature: ", expectedSignature);
    console.log("[verifyPayment] Razorpay Signature: ", razorpaySignature);

    if (expectedSignature !== razorpaySignature) {
      return { 
        success: false, 
        message: "Signature verification failed.", 
        paymentDetails 
      };
    }

    return { 
      success: true, 
      message: "Payment successful and verified.", 
      paymentDetails // Pass the full payment details in the response
    };
  } catch (error) {
    console.error("[verifyPayment] Error:", error);
    return { success: false, message: "Error verifying payment." };
  }
};

const confirmRazorpayPayment = async (request, response) => {
  console.log("Inside confirmPayment request", request);
  const paymentDetails = JSON.parse(request.event.body);
  console.log("Inside confirmPayment paymentDetails", paymentDetails);
  const paymentId = paymentDetails.payment_id;
  const orderId = paymentDetails.order_id;
  const cartItems = paymentDetails.cartItems;
  const razorpaySignature = paymentDetails.signature;
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  console.log("Inside confirmPayment cartItems", cartItems);
  console.log("Inside confirmPayment userId", userId);
  console.log("Inside confirmPayment paymentId", paymentId);
  console.log("Inside confirmPayment orderId", orderId);

  if (!paymentId || !orderId || !razorpaySignature) {
    return { statusCode: 400, body: "Invalid payment details" };
  }

  const verification = await verifyPayment(paymentId, orderId, razorpaySignature);

  if (!verification.success) {
    return { statusCode: 400, body: verification.message };
  }

  // Save payment details after verification
  const saveResponse = await savePaymentDetails(verification.paymentDetails, userId, cartItems, razorpaySignature);
  if (!saveResponse.success) {
    return { statusCode: 500, body: "Error storing payment details" };
  }

  // If payment is verified, add courses
  try {
    for (const record of cartItems) {
      await addMyCourse(record, userId);
    }
    return { statusCode: 200, body: "Courses added successfully" };
  } catch (error) {
    console.error("Error inserting courses:", error);
    return { statusCode: 500, body: "Error inserting courses into database" };
  }
};

const savePaymentDetails = async (paymentDetails, userId, cartItems, razorpaySignature) => {
  try {
    console.log("Inside savePaymentDetails userId", userId);
    console.log("Inside savePaymentDetails cartItems", cartItems);
    console.log("Inside savePaymentDetails paymentDetails", paymentDetails);  
    const params = {
      TableName: paymentHistoryTable,
      Item: {
        paymentid: paymentDetails.id,             // Razorpay payment ID
        orderid: paymentDetails.order_id,        // Order ID
        userid: userId,                           // Buyer ID
        amount: paymentDetails.amount,           // Amount paid
        currency: paymentDetails.currency,       // INR, USD, etc.
        status: paymentDetails.status,           // captured, failed, etc.
        paymentmethod: paymentDetails.method,    // upi, card, wallet, etc.
        upitransactionid: paymentDetails.acquirer_data?.upi_transaction_id || null, // UPI txn ID
        bankreference: paymentDetails.acquirer_data?.rrn || null,  // Bank reference
        email: paymentDetails.email,             // Customer email
        contact: paymentDetails.contact,         // Customer phone number
        fee: paymentDetails.fee,                 // Razorpay fee
        tax: paymentDetails.tax,                 // Tax applied
        amountrefunded: paymentDetails.amount_refunded,  // Refund status
        refundstatus: paymentDetails.refund_status || null, 
        paymentdescription: paymentDetails.description || null,
        custemail: paymentDetails.email || null,
        custcontact: paymentDetails.contact || null,
        createdat: new Date(paymentDetails.created_at * 1000).toISOString(), // Payment timestamp
        cartitems: cartItems || [], // Store purchased items
        razorpaysignature: razorpaySignature || null, // Signature for verification
        errordetails: paymentDetails.error_description || null // Error (if any)
      },
    };

    console.log("Saving payment details:", params);

    await dynamoDBExam.put(params).promise();
    return { success: true, message: "Payment details saved successfully." };
  } catch (error) {
    console.error("Error saving payment details:", error);
    return { success: false, message: "Error saving payment details.", error };
  }
};

//******************* Common Functions -->> End **************************************/

//------------------------------------------------------------------------
// LAMBDA ROUTER
//------------------------------------------------------------------------

/*
 
  This uses a custom Lambda container that I have created that is very 
  similar to what I use for my projects in production (with the only
  exception being that it is JavaScript and not TypeScript). I have
  released this as an npm package, lambda-micro, and you can view it
  at the link below.
 
  This is similar to what you can do with something like Express, but it 
  doesn't have the weight of using Express fully.
 
  https://github.com/davidtucker/lambda-micro
 
*/
const router = createRouter(RouterType.HTTP_API_V2);


//******************* Routes for Tutor -->> Start **************************************/

//Create Exam Package - Create a new exam package which will have package title, description, etc
router.add(
  Matcher.HttpApiV2("POST", "/questions/createpackage/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(createPackage)
);

router.add(
  Matcher.HttpApiV2("GET", "/questions/gettutorpacks/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getMyLearningPacksFromDB)
);

router.add(
  Matcher.HttpApiV2("POST", "/questions/publishpack/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(publishPack)
);

//Create Exam - Create a new exam which will have title, description, num of questions and alloted time
router.add(
  Matcher.HttpApiV2("POST", "/questions/createexam/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(createExam)
);

//Update Exam Package
router.add(
  Matcher.HttpApiV2("POST", "/questions/updatepack/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(updatePack)
);

//Update Exam 
router.add(
  Matcher.HttpApiV2("POST", "/questions/updateexam/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(updateExam)
);

//Upload json - Uploads all question from file
router.add(
  Matcher.HttpApiV2("POST", "/questions/upload/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(uploadQuestionsFile)
);

// Add a new question for a exam
router.add(
  Matcher.HttpApiV2("POST", "/questions/addquestion/"),
  enforceGroupMembership(["admin", "tutor"]),
  // validateBodyJSONVariables(schemas.addQuestion),
  requireLoggedInUser(addQuestion)
);

// Update question for a exam
router.add(
  Matcher.HttpApiV2("POST", "/questions/updatequestion/"),
  enforceGroupMembership(["admin", "tutor"]),
  // validateBodyJSONVariables(schemas.addQuestion),
  requireLoggedInUser(updateQuestion)
  //  requireLoggedInUser(updateQuestionPartiQL),
);

// Delete a question from the exam - check if this is working / getting used
// This is not getting used - 09-Aug-2023
router.add(
  Matcher.HttpApiV2("DELETE", "/questions/(:questionId)/(:questionid)"),
  enforceGroupMembership(["admin", "tutor"]),
  validatePathVariables(schemas.deleteQuestion),
  requireLoggedInUser(deleteQuestion)
);

//Get count of questions for a paper
router.add(
  Matcher.HttpApiV2("GET", "/questions/getquestionscount/(:pid)"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getQuestionsCount)
);

//Get submitted papers questions for a tutor
router.add(
  Matcher.HttpApiV2("GET", "/questions/getspquestions/(:pid)"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getSPQuestions)
);

//Get Questions related image
router.add(
  Matcher.HttpApiV2("GET", "/questions/getquestionimg/(:pid)/(:qid)"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(fetchQuestionImage)
);


//Get submitted papers questions and answers for review results for a student
router.add(
  Matcher.HttpApiV2(
    "GET",
    "/questions/getspquestionsreviewans/(:pid)/(:packid)"
  ),
  //  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getSPQuestionsReviewAnswers)
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2("GET", "/questions/getuserpapers/"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getSubmittedPapersForUser)
);

//getTutorPapers - Get all the papers submitted by the tutor
//This is not getting used - 08-Aug-2023
router.add(
  Matcher.HttpApiV2("GET", "/questions/getpapermstr/(:paperid)"),
  enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getPaperMstr)
);

// Publish exam
router.add(
  Matcher.HttpApiV2("POST", "/questions/publishexam/"),
  enforceGroupMembership(["admin", "tutor"]),
  // validateBodyJSONVariables(schemas.addQuestion),
  requireLoggedInUser(publishExam)
  //  requireLoggedInUser(updateQuestionPartiQL),
);

//******************* Routes for Tutor -->> End **************************************/

//******************* Routes for Student -->> Start **************************************/

//Adding users purchased courses in mycourse table
router.add(
  Matcher.HttpApiV2("POST", "/questions/addmycourses/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  // requireLoggedInUser,
  requireLoggedInUser(addMyCoursesForUser)
);


//Get MyCourses for a user - Get users purchased courses
router.add(
  Matcher.HttpApiV2("GET", "/questions/getmycourses/"),
  requireLoggedInUser(getMyCoursesForUserFromS3)
);

//Get Pack Courses for user
router.add(
  Matcher.HttpApiV2("POST", "/questions/getpackcourses/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getPackCoursesForUserFromS3)
);

//Get details of paper for a pack
router.add(
  Matcher.HttpApiV2("POST", "/questions/getpackpapdtls/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getpackpapdtls)
);

//Get MyCourses for a user - Get users purchased courses
router.add(
  Matcher.HttpApiV2("GET", "/questions/getmylearningpacks/"),
  requireLoggedInUser(getMyLearningPacksFromS3)
);

// Get all questions for a Exam for a paperid
router.add(
  Matcher.HttpApiV2("GET", "/questions/getexam/(:paperid)/(:packid)"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validatePathVariables(schemas.getQuestion),
  requireLoggedInUser(getExamQuestions)
);

//Save Exam Result
router.add(
  Matcher.HttpApiV2("POST", "/questions/saveresult/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(saveResultBatch)
);

//Save User Feedback and ratings
router.add(
  Matcher.HttpApiV2("POST", "/questions/saveuserfeedback/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(saveUserFeedback)
);

// Get user feedback for a paper
router.add(
  Matcher.HttpApiV2("GET", "/questions/getuserfeedback/(:pid)"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validatePathVariables(schemas.getQuestion),
  requireLoggedInUser(getUserFeedback)
);

// Get all questions and answers for a Exam for a paperid (this is shown for exam review)
router.add(
  Matcher.HttpApiV2("GET", "/questions/getmyexamreview/(:pid)"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validatePathVariables(schemas.getQuestion),
  requireLoggedInUser(getMyExamReview)
);

//******************* Routes for Student -->> End **************************************/

//******************* Common Routes -->> Start **************************************/

//Get User Profile
router.add(
  Matcher.HttpApiV2("GET", "/questions/getuserprofile/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(fetchUserProfile)
);

//Get User Profile
router.add(
  Matcher.HttpApiV2("GET", "/questions/getmycredits/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(getMyCreditsParent)
);

//Create User Profile
router.add(
  Matcher.HttpApiV2("POST", "/questions/createuserprofile/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  createUserProfile
);

//Update User Profile
router.add(
  Matcher.HttpApiV2("POST", "/questions/updateuserprofile/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(updateUserProfile)
);

//Update User Profile Image
router.add(
  Matcher.HttpApiV2("POST", "/questions/updateuserprofileimage/"),
  //  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(updateUserProfileImage)
);

// This is not getting used - 09-Aug-2023
router.add(
  Matcher.HttpApiV2("DELETE", "/questions/deleteprofileimage/"),
  // enforceGroupMembership(["admin", "tutor"]),
  // validatePathVariables(schemas.deleteQuestion),
  requireLoggedInUser(deleteUserProfileImage)
);

//Get Top 10 papers based on ratings
router.add(
  Matcher.HttpApiV2("GET", "/questions/gettoppackages/"),
  // enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  //getTopTenPapers
  requireLoggedInUser(getTopTenPackagesFromS3)
);

//Get Top 10 papers based on ratings
router.add(
  Matcher.HttpApiV2("GET", "/questions/gettoppapers/"),
  // enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  //getTopTenPapers
  requireLoggedInUser(getTopTenPapersFromS3)
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2("POST", "/questions/searchexam/"),
  //  enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  searchExam
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2("POST", "/questions/searchpack/"),
  //  enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  searchPacks
);


//Calling updateTopTenPaperCache for testing purpose only....to be deleted and replaced with setInterval function
router.add(
  Matcher.HttpApiV2("GET", "/questions/updatecache/"),
  enforceGroupMembership(["admin"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(updateTopTenPaperCache)
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2("POST", "/questions/contactus/"),
  //  enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  contactUsMsgs
);

//Razorpay API endpoint for order creation.
router.add(
  Matcher.HttpApiV2("POST", "/questions/razorpaycreateorder/"),
  // enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(razorpayCreateOrder)
);

//Razorpay API endpoint for order creation.
router.add(
  Matcher.HttpApiV2("POST", "/questions/confirmrazorpaypayment/"),
  // enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(confirmRazorpayPayment)
);


//Razorpay API endpoint for order creation.
router.add(
  Matcher.HttpApiV2("POST", "/questions/phonepecreateorder/"),
  // enforceGroupMembership(["admin", "tutor"]),
  //  validateRequestBody(schemas.uploadJSON),
  requireLoggedInUser(phonepeCreateOrder)
);

//******************* Common Routes -->> End **************************************/

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
