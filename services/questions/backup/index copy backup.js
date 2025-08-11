/*
  
  Questions Service

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
  enforceGroupMembership
} from 'lambda-micro';
//import express from 'express';
import { parse } from 'papaparse';
import fs from 'fs';
//import { AWSClients } from '../common';
import { AWSClients, generateID } from '../common';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup S3 Client
const s3 = AWSClients.s3();

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
const paperQuestionsTable = process.env.DYNAMO_DB_PAPERQUESTIONS_TABLE;
const submittedPapersTable = process.env.DYNAMO_DB_SUBMITTEDPAPERS_TABLE;



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
  addQuestion: require('./schemas/createQuestion.json'),
  deleteQuestion: require('./schemas/deleteQuestion.json'),
  getQuestion: require('./schemas/getQuestion.json'),
  createDocument: require('./schemas/uploadCSV.json'),
  uploadJSON: require('./schemas/uploadJSON.json'),
};


//------------------------------------------------------------------------
// UTILITY FUNCTIONS
//------------------------------------------------------------------------

const uploadFileToS3 = async (id, formFile) => {
  // console.log("process.env.UPLOAD_BUCKET -> ", process.env.UPLOAD_BUCKET);
  // console.log("Key -> ", `${id}.csv`);
  // console.log("formFile.content -> ", formFile.content);
  // console.log("formFile.contentType -> ", formFile.contentType);

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
// const jsonBodyParser = (event) => {
//   if (event.headers['content-type'] === 'application/json') {
//     return JSON.parse(event.body);
//   }
//   return {};
// };


//------------------------------------------------------------------------
// SERVICE FUNCTIONS
//------------------------------------------------------------------------

// Get all questions for a Exam
const getQuestion = async (request, response) => {
  const params = {
    TableName: paperQuestionsTable,
    IndexName: 'GSI1',
    KeyConditionExpression: 'SK = :key ',
    ExpressionAttributeValues: {
      ':key': 'GK#GK India',
    },
  };
  const results = await dynamoDBExam.query(params).promise();
  return response.output(results.Items, 200);
};

// Get all questions for a Exam
const getExamQuestions = async (request, response) => {
  console.log("Request in getExamQuestions -> ", request);
  const params = {
    TableName: paperQuestionsTable,
    //    IndexName: 'GSI1',
    KeyConditionExpression: 'PK = :key AND begins_with(SK, :skval)',
    ExpressionAttributeValues: {
      ':key': 'fansnavin@gmail.com',
      ':skval': 'GK#GK India',
    },
  };
  const results = await dynamoDBExam.query(params).promise();
  return response.output(results.Items, 200);
};

// Get all questions for a Exam
const getSubmittedPapersForUser = async (request, response) => {
  const params = {
    TableName: submittedPapersTable,
    KeyConditionExpression: 'userid = :userId',
    ExpressionAttributeValues: {
      ':userId': request.event.requestContext.authorizer.jwt.claims.username,
    },
  };

  try {
    const result = await dynamoDBExam.query(params).promise();
    return result.Items;
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};

const getPaperMstr = async (request, response) => {
  try {
    const papers = await getSubmittedPapersForUser(request.event.requestContext.authorizer.jwt.claims.username);
    response.status(200).json(papers);
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    response.status(500).json({ error: 'Failed to get submitted papers' });
  }
};


// Get details from PaperMaster for a paper id
const getPaperMstrforaPaper = async (request, response) => {
        // Query the created record and return it as the response body
        console.log(" request -> ", request);
        console.log(" request.pathVariables.paperid -> ", request.pathVariables.paperid);
        const queryResultGetExamDetails = await dynamoDBExam.get({
          TableName: submittedPapersTable,
          Key: {
            "userid": request.event.requestContext.authorizer.jwt.claims.username,
            "paperid": request.pathVariables.paperid
          }
        }).promise();
        return { statusCode: 200, body: JSON.stringify(queryResultGetExamDetails.Item) };
};


//General module for inserting data in questionsTable 
// Creates a new question for a Exam
const insertToQuestionsTable = async (record, userid) => {
try {
  // Query the submittedPapersTable to get the last paperid
  const queryResult = await dynamoDBExam.query({
    TableName: paperQuestionsTable,
    KeyConditionExpression: "#userid = :userid AND begins_with(#pqid, :paperid)",
    ExpressionAttributeNames: {
      "#userid": "userid",
      "#pqid": "pqid"
    },
    ExpressionAttributeValues: {
      ":userid": userid,
      ":paperid": record.paperid + "-" //searching with paperid followed by "-" and the comlumn as combination of paper id-question id
    },
    ScanIndexForward: false, // sort in descending order
    Limit: 1, // limit to one result
   // Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'qid'
  }).promise();

  let largestQuestionID = 0;
  if (queryResult.Items.length > 0) {
    console.log(" queryResult -> ", queryResult);
    largestQuestionID = queryResult.Items[0].qid;
  }

  // Generate the next paperid
  const nextQuestionId = largestQuestionID + 1;

 // const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

  const params = {
    TableName: paperQuestionsTable,
    Item: {
      "userid": userid,
      "qid": nextQuestionId,
      "pqid": record.paperid + "-" + nextQuestionId, //combination of paper id and question id to maintain the uniqueness of Partition and sort key       
      "paperid": record.paperid,
      "qt": record.question,
      "a": record.answer,
      "o1": record.option1,
      "o2": record.option2,
      "o3": record.option3,
      "o4": record.option4,
      "qe": record.answerExplanation
    }
  };

  console.log("dynamoDB createExam Params -> ", params);

  const results = await dynamoDBExam.put(params).promise();
  return response.output(results, 200);
  
} catch (err) {
  console.log("Error inserting JSON data into Database:", err);
  return { statusCode: 500, body: "Error inserting JSON data into Database" };
}
};

// Creates a new question for a Exam
const addQuestion = async (request, response) => {
  console.log("Inside addQuestion request 1.0 ");
  console.log("Inside addQuestion request ", request);
  const record = JSON.parse(request.event.body);
  console.log("Inside addQuestion record ", record);

  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }
try {
  // Query the submittedPapersTable to get the last paperid
  const queryResult = await dynamoDBExam.query({
    TableName: paperQuestionsTable,
    KeyConditionExpression: "#userid = :userid AND begins_with(#pqid, :paperid)",
    ExpressionAttributeNames: {
      "#userid": "userid",
      "#pqid": "pqid"
    },
    ExpressionAttributeValues: {
      ":userid": request.event.requestContext.authorizer.jwt.claims.username,
      ":paperid": record.paperid + "-" //searching with paperid followed by "-" and the comlumn as combination of paper id-question id
    },
    ScanIndexForward: false, // sort in descending order
    Limit: 1, // limit to one result
   // Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'qid'
  }).promise();

  let largestQuestionID = 0;
  if (queryResult.Items.length > 0) {
    console.log(" queryResult -> ", queryResult);
    largestQuestionID = queryResult.Items[0].qid;
  }

  // Generate the next paperid
  const nextQuestionId = largestQuestionID + 1;

 // const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

  const params = {
    TableName: paperQuestionsTable,
    Item: {
      "userid": request.event.requestContext.authorizer.jwt.claims.username,
      "qid": nextQuestionId,
      "pqid": record.paperid + "-" + nextQuestionId, //combination of paper id and question id to maintain the uniqueness of Partition and sort key       
      "paperid": record.paperid,
      "qt": record.question,
      "a": record.answer,
      "o1": record.option1,
      "o2": record.option2,
      "o3": record.option3,
      "o4": record.option4,
      "qe": record.answerExplanation
    }
  };

  console.log("dynamoDB createExam Params -> ", params);

  const results = await dynamoDBExam.put(params).promise();
  return response.output(results, 200);
      // // Query the created record and return it as the response body
      // const queryResultAfterInsert = await dynamoDBExam.get({
      //   TableName: paperQuestionsTable,
      //   Key: {
      //     "userid": request.event.requestContext.authorizer.jwt.claims.username,
      //     "paperid": nextPaperId
      //   }
      // }).promise();
      // return { statusCode: 200, body: JSON.stringify(queryResultAfterInsert.Item) };

} catch (err) {
  console.log("Error inserting JSON data into Database:", err);
  return { statusCode: 500, body: "Error inserting JSON data into Database" };
}
};


const createDocument = async (request, response) => {
  console.log("Inside createDocument request ", request);
  const records = JSON.parse(request.event.body);
  if (!records) {
    console.log("Inside createDocument 1.3 ")
    return { statusCode: 400, body: "No JSON data provided" };
  }
  for (const record of records.data.uploadData) {
    if (!record.hasOwnProperty('question') || !record.hasOwnProperty('option1') || !record.hasOwnProperty('option2') || !record.hasOwnProperty('option3') || !record.hasOwnProperty('option4') || !record.hasOwnProperty('answer')) {
      console.log('Skipping record as it does not have all required fields:', JSON.stringify(record));
      continue;
    }
    try {
//      console.log("dynamoDBExam Params -> ", params);
      console.log(`In createDocument  1 record -> `, record);
      let recordData = {"event": {"body":JSON.stringify(record)}};
      console.log(`In createDocument  2 - recordData -> `, recordData);
     const results = await addQuestion(recordData);
//      const results = await dynamoDBExam.put(params).promise();
    } catch (err) {
      console.log("Error inserting JSON data into Database:", err);
      return { statusCode: 500, body: "Error inserting JSON data into Database" };
    }
  }
  return { statusCode: 200, body: "Data uploaded successfully" };
};


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


const createExam = async (request, response) => {
  console.log("Inside createExam request 1.0 ");
  console.log("Inside createExam request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    // Query the submittedPapersTable to get the last paperid
    const queryResult = await dynamoDBExam.query({
      TableName: submittedPapersTable,
      KeyConditionExpression: "#userid = :userid AND #paperid > :paperid",
      ExpressionAttributeNames: {
        "#userid": "userid",
        "#paperid": "paperid"
      },
      ExpressionAttributeValues: {
        ":userid": request.event.requestContext.authorizer.jwt.claims.username,
        ":paperid": 0
      },
      ScanIndexForward: false, // sort in descending order
      Limit: 1 // limit to one result
    }).promise();

    let lastPaperId = 0;
    if (queryResult.Items.length > 0) {
      lastPaperId = queryResult.Items[0].paperid;
    }

    // Generate the next paperid
    const nextPaperId = lastPaperId + 1;

    const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const params = {
      TableName: submittedPapersTable,
      Item: {
        "userid": request.event.requestContext.authorizer.jwt.claims.username,
        "paperid": nextPaperId,
        "paperrating": paperrating,
        "examtitle": record.examTitle,
        "examdesc": record.examDescription,
        "numofq": record.numQuestions,
        "atime": record.allocatedTime,
        "paperprice": record.examPrice
      }
    };

    console.log("dynamoDB createExam Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();

        // Query the created record and return it as the response body
        const queryResultAfterInsert = await dynamoDBExam.get({
          TableName: submittedPapersTable,
          Key: {
            "userid": request.event.requestContext.authorizer.jwt.claims.username,
            "paperid": nextPaperId
          }
        }).promise();
        return { statusCode: 200, body: JSON.stringify(queryResultAfterInsert.Item) };

  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }

//  return { statusCode: 200, body: "Exam created successfully" };
};


// Get all questions for a Exam
const getExamDetails = async (request, response) => {
  console.log("Request in getExamQuestions -> ", request);
  const params = {
    TableName: paperQuestionsTable,
    //    IndexName: 'GSI1',
    KeyConditionExpression: 'PK = :key AND begins_with(SK, :skval)',
    ExpressionAttributeValues: {
      ':key': 'fansnavin@gmail.com',
      ':skval': 'GK#GK India',
    },
  };
  const results = await dynamoDBExam.query(params).promise();
  return response.output(results.Items, 200);
};





//Latest code for upload via file before modifying it to use addQuestions
// const createDocument = async (request, response) => {
//   console.log("Inside createDocument request ", request);
//   const records = JSON.parse(request.event.body);
//   if (!records) {
//     console.log("Inside createDocument 1.3 ")
//     return { statusCode: 400, body: "No JSON data provided" };
//   }
//   for (const record of records.data.uploadData) {
//     if (!record.hasOwnProperty('user') || !record.hasOwnProperty('questionId') || !record.hasOwnProperty('subject') || !record.hasOwnProperty('question') || !record.hasOwnProperty('option1') || !record.hasOwnProperty('option2') || !record.hasOwnProperty('option3') || !record.hasOwnProperty('option4') || !record.hasOwnProperty('answer')) {
//       console.log('Skipping record as it does not have all required fields:', JSON.stringify(record));
//       continue;
//     }
//     console.log(`In createDocument  1 `, record);
//     const params = {
//       TableName: paperQuestionsTable,
//       Item: {
//         "PK": record.user,
//         "SK": record.subject + "-" + record.questionId,
//         "q": record.question,
//         "a": record.answer,
//         "o1": record.option1,
//         "o2": record.option2,
//         "o3": record.option3,
//         "o4": record.option4,
//         "id": record.questionId
//       }
//     };

//     try {
//       console.log("dynamoDBExam Params -> ", params);

//       const results = await dynamoDBExam.put(params).promise();
//     } catch (err) {
//       console.log("Error inserting JSON data into Database:", err);
//       return { statusCode: 500, body: "Error inserting JSON data into Database" };
//     }
//   }
//   return { statusCode: 200, body: "Data uploaded successfully" };
// };


// Creates a new document
// const createDocument = async (request, response) => {
//   // const { files } = request.formData;
//   // const file = files[0];

//   const file = request.formData.files[0];

//   if (!file) {
//     return { statusCode: 400, body: "No file uploaded" };
//   }

//   const fileContent = file.buffer ? file.buffer.toString() : null;

// if (!fileContent) {
//   return { statusCode: 400, body: "File is empty or could not be read" };
// }

//   const records = parse(fileContent, { header: true }).data;
//   console.log(JSON.stringify(records));

//   // const records = parse(file.buffer.toString(), { header: true }).data;
//   // console.log(JSON.stringify(records));

//   try {
//     for (const record of records) {
//       const params = {
//         TableName: paperQuestionsTable,
//         Item: {
//           "PK": { S: record.category },
//           "SK": { S: record.level },
//           "question": { S: record.question },
//           "option1": { S: record.option1 },
//           "option2": { S: record.option2 },
//           "option3": { S: record.option3 },
//           "option4": { S: record.option4 },
//           "answer": { S: record.answer }
//         }
//       };
//       await dynamoDB.putItem(params).promise();
//     }
//     return { statusCode: 200, body: "Data uploaded successfully" };
//   } catch (err) {
//     console.log("Error processing CSV file:", err);
//     return { statusCode: 500, body: "Error processing CSV file" };
//   }
// };
// // Creates a new document
// const createDocument = async (request, response) => {
//   const file = request.formData.files[0];
//   // console.log("File content type is - > ", file.contentType);
//   file.contentType = 'text/csv';
//   const { fields } = request.formData;
//   const fileId = generateID();


//   const records = parse(file, { header: true }).data;

//   try {
//     for (const record of records) {
//       const params = {
//         TableName: paperQuestionsTable,
//         Item: {
//           "PK": { S: record.category },
//           "SK": { S: record.level },
//           "question": { S: record.question },
//           "option1": { S: record.option1 },
//           "option2": { S: record.option2 },
//           "option3": { S: record.option3 },
//           "option4": { S: record.option4 },
//           "answer": { S: record.answer }
//         }
//       };
//       await dynamoDB.send(new PutItemCommand(params));
//     }
//     return { statusCode: 200, body: "Data uploaded successfully" };
//   } catch (err) {
//     console.log("Error processing CSV file:", err);
//     return { statusCode: 500, body: "Error processing CSV file" };
//   }
// };


// // Creates a new document
// const createDocument = async (request, response) => {
//   const file = request.formData.files[0];
//   // console.log("File content type is - > ", file.contentType);
//   file.contentType = 'text/csv';
//   const { fields } = request.formData;
//   const fileId = generateID();

//   await uploadFileToS3(fileId, file);

//   const s3ReadStream = s3.getObject({ Bucket: process.env.UPLOAD_BUCKET, Key: `${fileId}.csv` }).createReadStream();

//   s3ReadStream
//   .on('data', (data) => {
//     process.stdout.write(data); // write data to stdout
//   })
//   .on('end', () => {
//     console.log('CSV file processed successfully');
//     response.output('Document created - Data Uploaded', 200);
//   });

//   const putItemPromises = [];
//   s3ReadStream.pipe(csv())
//     .on('data', (data) => {
//       console.log("JSON.stringify(data) -> ", JSON.stringify(data));
//       const params = {
//         TableName: paperQuestionsTable,
//         Item: {
//           'PK': { S: data.category },
//           'SK': { S: data.level },
//           'question': { S: data.question },
//           'answer': { S: data.answer },
//           'option1': { S: data.option1 },
//           'option2': { S: data.option2 },
//           'option3': { S: data.option3 },
//           'option4': { S: data.option4 }
//         }
//       };
//       putItemPromises.push(dynamoDB.putItem(params).promise());
//     })
//     .on('end', async () => {
//       console.log('Finished processing CSV file');
//       try {
//         await Promise.all(putItemPromises);
//         response.output('Document created - Data Uploaded', 200);
//       } catch (err) {
//         console.error(`Error processing CSV file: ${JSON.stringify(err)}`);
//         response.output('Error processing CSV file', 500);
//       }
//     });
// };




// // Creates a new document
// const createDocument = async (request, response) => {
//   const file = request.formData.files[0];
//   console.log("File content type is - > ", file.contentType);
//   file.contentType = 'text/csv';
//   const { fields } = request.formData;
//   const fileId = generateID();

//   // Upload File to S3
//   await uploadFileToS3(fileId, file);

//   // // Add to Database
//   // const item = {
//   //   PK: fileId,
//   //   SK: 'Doc#Marketing',
//   //   DateUploaded: new Date().toISOString(),
//   //   FileDetails: {
//   //     encoding: file.encoding,
//   //     contentType: file.contentType,
//   //     fileName: file.fileName,
//   //   },
//   //   Owner: request.event.requestContext.authorizer.jwt.claims.username,
//   //   //    Owner: 'fc4cec10-6ae4-435c-98ca-6964382fee77', // Hard-coded until we put users in place
//   //   Name: fields.name,
//   // };

//   // // Add Tags (if present)
//   // if (fields.tags && fields.tags.length > 0) {
//   //   item.Tags = fields.tags.split(',');
//   // }

//  const s3ReadStream = s3.getObject({ Bucket: process.env.UPLOAD_BUCKET, Key: `${fileId}.csv` }).createReadStream();

//   // Read CSV and insert record in database 
// // s3ReadStream
//  // fileStream = fs.createReadStream(file);

//  s3ReadStream
//     .pipe(csv())
//     .on('data', async (data) => {
//       console.log("Data object is -> ", data);
//       await dynamoDB.putItem({
//         TableName: paperQuestionsTable,
//         Item: {
//           'PK': { S: data.category },
//           'SK': { S: data.level },
//           'question': { S: data.question },
//           'owner': {S: request.event.requestContext.authorizer.jwt.claims.username },
//         }
//       }).promise();
//     })
//     .on('end', async () => {
//       console.log('CSV file processed successfully');
//       await response.output('Document created - Data Uploaded', 200);
//     })
//     .on('error', (error) => {
//       console.log('Error processing CSV file', error);
//       response.output('Error processing CSV file', 500);
//     });

//   // // Insert into Database
//   // const params = {
//   //   TableName: paperQuestionsTable,
//   //   Item: item,
//   //   ReturnValues: 'NONE',
//   // };
//   // await dynamoDB.put(params).promise();
// //  return response.output('Document created', 200);
// };

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

// Get all questions for a document
// GET /questions/(:docid)
router.add(
  Matcher.HttpApiV2('GET', '/questions/(:questionId)'),
  validatePathVariables(schemas.getQuestion),
  getQuestion,
);

// GET /questions/
router.add(
  Matcher.HttpApiV2('GET', '/questions/getexam/'),
  validatePathVariables(schemas.getQuestion),
  getExamQuestions,
);



// Create a new question for a document
// POST /questions/(:docid)
router.add(
  Matcher.HttpApiV2('POST', '/questions/addquestion/'),
 // validateBodyJSONVariables(schemas.addQuestion),
  addQuestion,
);

// //Upload json 
// router.add(
//   Matcher.HttpApiV2('POST', '/questions/'),
//   enforceGroupMembership(['admin', 'contributor']),
//   express.json(), // parsing json
//   // validateRequestBody(schemas.uploadJSON),
//   async (req, res) => {
//     try {
//       console.log(`In Router Try Catch 1 `);
//       if (req.body !== null && req.body !== undefined) {
//         let body = JSON.parse(req.body)
//         if (body.data) {
//           data = body.data;
//           console.log(`In Router Try Catch 1.1 req.data `, req.body.data);
//           let fileData = req.body.data;
//           console.log(`In Router Try Catch 1.2 `, fileData);
//           const result = await createDocument(req, res);
//           console.log(`In Router Try Catch 2 `);
//           res.send(result);
//         }
//       } else {
//         res.send("data is null or undefined");
//       }
//     } catch (err) {
//       console.log(`In Router Try Catch 3 `);
//       console.error(err);
//       res.send('CME Custom Message 1- Internal Server Error');
//     }
//   }
// );

//Upload json
router.add(
  Matcher.HttpApiV2('POST', '/questions/upload/'),
  enforceGroupMembership(['admin', 'contributor']),
  //  validateRequestBody(schemas.uploadJSON),
  createDocument,
);

//Create Exam
router.add(
  Matcher.HttpApiV2('POST', '/questions/createexam/'),
  enforceGroupMembership(['admin', 'contributor']),
  //  validateRequestBody(schemas.uploadJSON),
  createExam,
);

//getExamPaper for a paper id
router.add(
  Matcher.HttpApiV2('GET', '/questions/getpapermstr/(:paperid)'),
  enforceGroupMembership(['admin', 'contributor']),
  //  validateRequestBody(schemas.uploadJSON),
  getPaperMstr,
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2('GET', '/questions/getuserpapers/'),
  enforceGroupMembership(['admin', 'contributor']),
  //  validateRequestBody(schemas.uploadJSON),
  getSubmittedPapersForUser,
);


//Upload CSV 
// router.add(
//   Matcher.HttpApiV2('POST', '/questions/'),
//   enforceGroupMembership(['admin', 'contributor']),
//   parseMultipartFormData,
//   validateMultipartFormData(schemas.createDocument),
//   createDocument,
// );

// Delete a question for a document
// DELETE /questions/(:docid)/(:questionid)
router.add(
  Matcher.HttpApiV2('DELETE', '/questions/(:questionId)/(:questionid)'),
  validatePathVariables(schemas.deleteQuestion),
  deleteQuestion,
);

// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
