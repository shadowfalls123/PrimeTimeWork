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
// import { parse } from 'papaparse';
// import fs from 'fs';
//import { AWSClients } from '../common';
import { ulid } from 'ulid';
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
const dynamoDBHLExam = AWSClients.dynamoDBHL();
const dynamoDBPQL = AWSClients.dynamoDBPQL();

//const { marshall, unmarshall } = dynamoDBExam.Converter;

const paperQuestionsTable = process.env.DYNAMO_DB_PAPERQUESTIONS_TABLE;
const submittedPapersTable = process.env.DYNAMO_DB_SUBMITTEDPAPERS_TABLE;
const myCoursesTable = process.env.DYNAMO_DB_MYCOURSES_TABLE;
const examResultsTable = process.env.DYNAMO_DB_EXAMRESULTS_TABLE;
const examResultsHistoryTable = process.env.DYNAMO_DB_EXAMRESULTSHISTORY_TABLE;
const topRatedPapers = process.env.DYNAMO_DB_TOPRATEDPAPERS_TABLE;

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

// Get all questions for a Exam for a paperid
const getExamInstructions = async (request, response) => {
  console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestions 2.0 -> request.pathVariables.paperid -->> ", request.pathVariables.paperid);
  const paperid = request.pathVariables.paperid;

  console.log("Request in getExamInstructions 1.0 -> ", paperid);
  const params = {
    TableName: submittedPapersTable,
    KeyConditionExpression: "paperid = :key",
    ExpressionAttributeValues: {
      //      ":key": parseInt(request.pathVariables.paperid)
      ":key": paperid
    },
    //    Limit: count
    //    IndexName: 'GSI1',
  };
  console.log("params in getExamInstructions 3.0 -> ", params);
  const results = await dynamoDBExam.query(params).promise();
  return response.output(results.Items, 200);
};

// Get all questions for a Exam for a paperid
const getExamQuestions = async (request, response) => {
  console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestions 2.0 -> request.pathVariables.paperid -->> ", request.pathVariables.paperid);
  const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const results = await getExamQuestionsChild(paperid);
  return results;
};

// Get all questions for a Exam for a paperid
const getExamQuestionsChild = async (paperid) => {
 // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log("In getExamQuestionsChild 1.0 -> paperid -->> ", paperid);
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  const params = {
    TableName: paperQuestionsTable,
    KeyConditionExpression: "paperid = :key",
    ExpressionAttributeValues: {
      //      ":key": parseInt(request.pathVariables.paperid)
      ":key": paperid
    },
    ProjectionExpression: "paperid, qid, a, o1, o2, o3, o4, qt",
    //    Limit: count
    //    IndexName: 'GSI1',
  };
  console.log("params in getExamQuestions 3.0 -> ", params);
  const results = await dynamoDBExam.query(params).promise();
  return results.Items;
};

const addMyCoursesForUser = async (request, response) => {
  console.log("Inside addMyCoursesForUser request ", request);
  const records = JSON.parse(request.event.body);
  if (!records) {
    console.log("Inside addMyCoursesForUser 1.3 ")
    return { statusCode: 400, body: "No JSON data provided" };
  }
  for (const record of records) {
    // if (!record.hasOwnProperty('question') || !record.hasOwnProperty('option1') || !record.hasOwnProperty('option2') || !record.hasOwnProperty('option3') || !record.hasOwnProperty('option4') || !record.hasOwnProperty('answer')) {
    //   console.log('Skipping record as it does not have all required fields:', JSON.stringify(record));
    //   continue;
    // }
    try {
      //      console.log("dynamoDBExam Params -> ", params);
      console.log(`In addMyCoursesForUser  1 record -> `, record);
      // let recordData = {"event": {"body":JSON.stringify(record)}};
      // console.log(`In createDocument  2 - recordData -> `, recordData);
      //  const results = await addQuestion(record);
      const results = await addMyCourse(record, request.event.requestContext.authorizer.jwt.claims.username);
      //      const results = await dynamoDBExam.put(params).promise();
    } catch (err) {
      console.log("Error inserting JSON data into Database:", err);
      return { statusCode: 500, body: "Error inserting JSON data into Database" };
    }
  }
  return { statusCode: 200, body: "Data uploaded successfully" };
};


// Add my purchased course - single record
const addMyCourse = async (record, userid) => {
  try {
    const today = new Date();
    const purchaseDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const params = {
      TableName: myCoursesTable,
      Item: {
        "userid": userid,
        "paperid": record.paperid,
        "purchasedt": purchaseDate,
        "purchaseprice": record.purchaseprice
      }
    };

    console.log("dynamoDB addMyCoursesForUser Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Data inserted successfully." };

  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Get my all purchase courses
const getMyCoursesForUser = async (request, response) => {
  try {
    console.log("getMyCoursesForUser-->> 1.0 ");
    console.log("getMyCoursesForUser-->> 1.0 ", request);
    const params = {
      TableName: myCoursesTable,
      KeyConditionExpression: 'userid = :userId',
      ExpressionAttributeValues: {
        ':userId': request.event.requestContext.authorizer.jwt.claims.username,
      },
    };


    console.log("getMyCoursesForUser params-->> ", params);
    const result = await dynamoDBExam.query(params).promise();

    // Collect all paperids into an array
    const paperIds = result.Items.map(item => item.paperid);
    console.log("PaperIds -> ", paperIds);

    const sbResults1 = await getPaperDetails(paperIds);
    console.log("sbResults1 -> ", sbResults1);
    // const sbResults2 = await getSinglePaperDetails(paperIds);
    // console.log("sbResults2 -> ", sbResults2);
    //  const marshallResult = sbResults1.Items.map((item) => unmarshall(marshall(item)));
    
   return sbResults1;
    // if (sbResults1.Items.length > 0) {
    //   return sbResults1;
    // } else {
    //   return { message: "No data exists" };
    // }
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};


const getPaperDetails = async (paperIds) => {
  try {
    // Construct BatchGetItem request to retrieve papers by id

    // const papersParams = {
    //   RequestItems: {
    //     [submittedPapersTable]: { // Use the submittedPapersTable variable to specify the table name
    //       Keys: paperIds.map(paperId => ({ 
    //         "paperid": paperId
    //       })),
    //       IndexName: "GSI2", // Specify the index name
    //       KeyConditionExpression: "paperid = :paperidVal", // Set the key condition expression for the index
    //       ExpressionAttributeValues: {
    //         ":paperidVal": paperId // Set the value of the paperid to filter the results
    //       },
    //       ProjectionExpression: 'userid, paperid, examtitle, examdesc, paperrating, numofq, atime'
    //     }
    //   }
    // };

    // Keys: paperIds.map((paperId) => ({ paperid: paperId })),

    // //-----------------Keep for Reference----------------------//
    //     //Using DynamoDB API - not working (This logic works for Primary Keys and does not work for Indexs)
    //     const papersParams = {
    //       RequestItems: {
    //         [submittedPapersTable]: {
    //           Keys: [{ "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 6}, { "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 7}],
    //           ProjectionExpression: "paperid",
    // //          IndexName: "GSI2",
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
      Statement: `SELECT paperid, examtitle, examdesc, numofq, paperrating, atime FROM ${submittedPapersTable}.GSI2 WHERE paperid IN ('${paperIdsString}')`,

      //      Statement: `SELECT userid FROM ${submittedPapersTable} WHERE userid = '${userId}'`

      //      Parameters: paperIds,
    };

    console.log("papersParams-->>", papersParams);
    const papersResult = await dynamoDBPQL.queryPartiQL(papersParams);

    // const papersParams = {
    //   Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE paperid IN (${paperIds.map(() => ":paperid").join(",")})`,
    //   Parameters: {
    //     ':examtitle': 'Class 12 Maths',
    //   },
    //   ConsistentRead: true,
    //   IndexName: 'GSI2',
    // };


    // const papersParams = {
    //   Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE examtitle = :examtitle AND paperid IN (${paperIds.map(() => ":paperid").join(",")}) ORDER BY examtitle DESC`,
    //   Parameters: {
    //     ':examtitle': 'Class 12 Maths',
    //   },
    //   ConsistentRead: true,
    //   IndexName: 'GSI2',
    // };

    // // Add each paper ID as a parameter
    // paperIds.forEach((paperId, index) => {
    //   papersParams.Parameters[`:paperid${index}`] = paperId;
    // });


    //using PartiQL
    // const papersParams = {
    //   Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE examtitle = :examtitle AND paperid IN (${paperIds.map(() => "?").join(",")}) ORDER BY examtitle DESC`,
    //   Parameters: {
    //     ':examtitle': 'Class 12 Maths', // Replace with the partition key value for GSI2
    //     ...paperIds,
    //   },
    //   ConsistentRead: true, // Optional: set this to true if you need a strongly consistent read from the index
    //   IndexName: 'GSI2', // Specify the name of the GSI
    // };

    // console.log("papersParams-->>", papersParams);

    // const result = await dynamoDBPQL.queryPartiQL(papersParams);



    // // Merge the purchased courses and the retrieved papers
    // const purchasedCourses = result.Items.map(purchasedCourse => {
    //   const paperData = papersResult.Responses.submittedPapers.find(paper => paper.paperid === purchasedCourse.paperid);
    //   return { ...purchasedCourse, ...paperData };
    // });

    // return purchasedCourses;
    return papersResult;
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};

const getSinglePaperDetails = async (paperIds) => {
  try {
    const papersParams = {
      TableName: submittedPapersTable,
      IndexName: "GSI2",
      KeyConditionExpression: "paperid = :id",
      ExpressionAttributeValues: {
        ":id": { N: "6" }
      },
      ProjectionExpression: "paperid"
    };
    console.log("papersParams-->>", papersParams);

    const papersResult = await dynamoDBExam.query(papersParams).promise();
    console.log("Data Retreived successfully ");

    return papersResult;
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};

// Update the cache every 10080 minutes (10080 minutes equates to 7 days) 
//setInterval(updateTopTenPaperCache, 10080 * 60 * 1000);

//updateTopTenPaperCache Table 
const updateTopTenPaperCache = async (request, response) => {
  // const params = {
  //   TableName: submittedPapersTable,
  //   IndexName: "PaperratingIndex",
  //   KeyConditionExpression: "#rating >= :rating",
  //   ExpressionAttributeNames: {
  //     "#rating": "paperrating",
  //   },
  //   ExpressionAttributeValues: {
  //     ":rating": 0,
  //   },
  //   ProjectionExpression: "paperid, paperrating",
  //   Limit: 10,
  //   ScanIndexForward: false,
  // };

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
            examtitle: item.examtitle
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
    console.log("Top10Paper JSON.stringify(params) -->>", JSON.stringify(params));
    await dynamoDBExam.batchWrite(params).promise();
    console.log("Cache updated successfully");
  } catch (error) {
    console.error("Error updating cache:", error);
  }
}


//Get exams based on the search criteria
const searchExam = async (request, response) => {
  console.log("In searchExam request -->> ", request);
  console.log("In searchExam request -->> ", request.event.body);
  const requestBody = JSON.parse(request.event.body);
  console.log("In searchExam request -->> ", requestBody.searchText);
  const result = await searchExamQuery(requestBody);
  return result;
};

//Get exams based on the search criteria
const searchExamQuery = async (requestBody) => {
  try {
    const params = {
      TableName: submittedPapersTable,
      IndexName: "GSI1",
//      KeyConditionExpression: "#dummycolumn = :dummycolumn AND #rating >= :rating AND begins_with(#examtitle, :examtitle)",
KeyConditionExpression: "#dummycolumn = :dummycolumn AND #rating >= :rating",
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
      FilterExpression: "begins_with(#examtitle, :examtitle) AND published = :published",
      ProjectionExpression: "paperid, examtitle, examdesc, paperrating, paperprice",
      Limit: 10,
//      ScanIndexForward: false, //By default, the sort order is ascending. To reverse the order, set the ScanIndexForward parameter to false
    };


    const result = await dynamoDBExam.query(params).promise();
    return result.Items;
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};

//Get top 10 papers based on top ratings
const getTopTenPapers = async (request, response) => {
  
  const result = await getTopTenPapersFromSubmittedPaperTab();
  return result;
};

//Get top 10 papers based on top ratings
const getTopTenPapersFromSubmittedPaperTab = async () => {
  try {
    const params = {
      TableName: submittedPapersTable,
      IndexName: "GSI1",
      KeyConditionExpression: "#rating >= :rating AND #dummycolumn = :dummycolumn",
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
      ProjectionExpression: "paperid, examtitle, examdesc, paperrating, paperprice",
      Limit: 10,
      ScanIndexForward: false, //By default, the sort order is ascending. To reverse the order, set the ScanIndexForward parameter to false
    };


    const result = await dynamoDBExam.query(params).promise();
    return result.Items;
  } catch (err) {
    console.error('Error getting submitted papers for user', err);
    throw err;
  }
};

// Get all submitted papers for a user
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

//Get all papers for a user
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
    //--------------Code to get last inserted questionid and increment it by 1 (when questionid was numeric) - Start----------------------//    
    //     // Query the submittedPapersTable to get the last paperid
    //     const queryResult = await dynamoDBExam.query({
    //       TableName: paperQuestionsTable,
    //       KeyConditionExpression: "#userid = :userid AND begins_with(#pqid, :paperid)",
    //       ExpressionAttributeNames: {
    //         "#userid": "userid",
    //         "#pqid": "pqid"
    //       },
    //       ExpressionAttributeValues: {
    //         ":userid": userid,
    //         ":paperid": record.paperid + "-" //searching with paperid followed by "-" and the comlumn as combination of paper id-question id
    //       },
    //       ScanIndexForward: false, // sort in descending order
    //       Limit: 1, // limit to one result
    //       // Select: 'SPECIFIC_ATTRIBUTES',
    //       ProjectionExpression: 'qid'
    //     }).promise();

    //     let largestQuestionID = 0;
    //     if (queryResult.Items.length > 0) {
    //       console.log(" queryResult -> ", queryResult);
    //       largestQuestionID = queryResult.Items[0].qid;
    //     }

    //     // Generate the next paperid
    //     const nextQuestionId = largestQuestionID + 1;
    // //--------------Code to get last inserted questionid and increment it by 1 (when questionid was numeric) - Start----------------------//

    // const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const timestamp = Date.now();
    const nextQuestionId = ulid(timestamp);
    console.log("nextQuestionId -->> ", nextQuestionId);

    const params = {
      TableName: paperQuestionsTable,
      Item: {
        "userid": userid,
        "qid": nextQuestionId,
        //        "pqid": record.paperid + "-" + nextQuestionId, //combination of paper id and question id to maintain the uniqueness of Partition and sort key       
        //        "pqid": record.paperid + "-" + nextQuestionId,
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

    console.log("dynamoDB insertToQuestionsTable Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Data inserted successfully." };

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
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  const results = await insertToQuestionsTable(record, userid);
  return { statusCode: 200, body: "Data inserted successfully." };
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
      // let recordData = {"event": {"body":JSON.stringify(record)}};
      // console.log(`In createDocument  2 - recordData -> `, recordData);
      //  const results = await addQuestion(record);
      const results = await insertToQuestionsTable(record, request.event.requestContext.authorizer.jwt.claims.username);
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


// // Function to generate a new paper ID using DynamoDB atomic counter
// async function getNextPaperId(userid) {
//   const params = {
//     TableName: submittedPapersTable,
//     Key: {
//     userid, //{ "created_at": new Date().toISOString() },
//     "paperid": 0 // dummy value for the sort key
//   },
//     UpdateExpression: "ADD paperid :incr", //"ADD paperid_counter :incr",
//     ExpressionAttributeValues: { ":incr": 1 },
//     ReturnValues: "UPDATED_NEW"
//   };

//   const result = await dynamoDBExam.update(params).promise();
//   return result.Attributes.paperid;
// }


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
    //    const nextPaperIDTest = await getNextPaperId(userid);
    //    console.log("nextPaperIDTest -->> ",nextPaperIDTest); 

    // //--------------Code to get last inserted paperid and increment it by 1 (when paperid was numeric) - Start----------------------//
    // // Query the submittedPapersTable to get the last paperid
    // const queryResult = await dynamoDBExam.query({
    //       TableName: submittedPapersTable,
    //       KeyConditionExpression: "#userid = :userid AND #paperid > :paperid",
    //       ExpressionAttributeNames: {
    //         "#userid": "userid",
    //         "#paperid": "paperid"
    //       },
    //       ExpressionAttributeValues: {
    //         ":userid": userid,
    //         ":paperid": 0
    //       },
    //       ScanIndexForward: false, // sort in descending order
    //       Limit: 1 // limit to one result
    //     }).promise();

    //     let lastPaperId = 0;
    //     if (queryResult.Items.length > 0) {
    //       lastPaperId = queryResult.Items[0].paperid;
    //     }

    //     // Generate the next paperid
    //     const nextPaperId = lastPaperId + 1;
    // //--------------Code to get last inserted paperid and increment it by 1 (when paperid was numeric) - End----------------------//


    const paperrating = 0; //Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const params = {
      TableName: submittedPapersTable,
      Item: {
        "userid": userid,
        "paperid": nextPaperId,
        "paperrating": paperrating,
        "examtitle": record.examTitle,
        "examdesc": record.examDescription,
        "numofq": record.numQuestions,
        "atime": record.allocatedTime,
        "paperprice": record.examPrice,
        "dummycolumn": 1,
        "published": 0
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

//For Saving single result record  in the database - question by question
const saveEachQuestionResult = async (request, response) => {
  console.log("Inside saveResult request 1.0 ");
  console.log("Inside saveResult request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const params = {
      TableName: examResultsTable,
      Item: {
        "userid": request.event.requestContext.authorizer.jwt.claims.username,
        "paperid": record.paperid,
        "qid": record.qid,
        "a": record.selectedAnswer,
        "score": record.score, //1 for right answer, 0 for wrong answer
      }
    };

    console.log("dynamoDB createExam Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Result saved successfully" }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Inserting complete result for a exam - batch Insert of result for all questions
const saveResultBatch = async (request, response) => {
  try {
    console.log("Inside saveResultBatch request 1.0 ");
    console.log("Inside saveResultBatch request ", request);
    const examUserAnswers = JSON.parse(request.event.body);
    const paperid = examUserAnswers[0].paperid;
    console.log("Inside saveResultBatch examUserAnswers ", examUserAnswers);
    if (!examUserAnswers) {
      return { statusCode: 400, body: "No JSON data provided" };
    }
    const actualAnswersforPaper = await getAnswersforPaper(paperid);
    console.log("answersforPaper -->> ", actualAnswersforPaper)

//Calculate score
// Initialize the exam score
let examscore = 0;
const examdate = new Date().toISOString();


// Create a new array with updated answers
const updatedAnswers = examUserAnswers.map(answer => {
  // Find the corresponding question in actualAnswersforPaper
  const question = actualAnswersforPaper.find(q => q.qid === answer.qid && q.paperid === answer.paperid);
  
  // Compare the selected answer with the actual answer
  const score = (question && question.a === answer.selectedAnswer) ? 1 : 0;
  examscore = examscore + score;
  // Return the updated answer object
  return {
    ...answer,
    score: score,
    examdate: examdate
  };
});

console.log("updatedAnswers -->> ", updatedAnswers);
// // Replace examUserAnswers with updatedAnswers
// examUserAnswers = updatedAnswers;

      // Print the exam score
      console.log(`Exam score: ${examscore}/${updatedAnswers.length}`);
    const totalquestions = updatedAnswers.length;
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    

    const resultHistoryParams = {
      TableName: examResultsHistoryTable,
      Item: {
        "userid": userid,
        "paperid": paperid + "-" + examdate,
        "examscore": examscore,
        "totalquestions": totalquestions,
        "examdate": examdate
//        "score": record.score, //1 for right answer, 0 for wrong answer
      }
    };

    console.log("dynamoDB createExam resultHistoryParams -> ", resultHistoryParams);

    const resultHistoryResults = await dynamoDBExam.put(resultHistoryParams).promise();
    console.log("dynamoDB Save Result resultHistoryResults -> ", resultHistoryResults);
    
    //   return { statusCode: 200, body: "Exam History saved successfully" }


    const params = {
      RequestItems: {
        [examResultsTable]: updatedAnswers.map((record) => ({
          PutRequest: {
            Item: {
              ...record, //the spread operator (...) to merge the item object with a new object that has the userId property set to the userId value.
              userid: userid,
              //            pqid: `${record.paperid}-${record.qid}`
            }
          },
        })),
      },
    };
    console.log("dynamoDB saveResultBatch Params -> ", params);
    console.log("dynamoDB saveResultBatch Params -> ", JSON.stringify(params));
    const results = await dynamoDBExam.batchWrite(params).promise();
    console.log("dynamoDB saveResultBatch results -> ", results);
    return { "examscore":examscore, "totalquestions":totalquestions }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
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
       ":key": paperid
     },
     ProjectionExpression: "paperid, qid, a, o1, o2, o3, o4, qt",
     //    Limit: count
     //    IndexName: 'GSI1',
   };
   console.log("params in getAnswersforPaper 3.0 -> ", params);
   const results = await dynamoDBExam.query(params).promise();
   return results.Items;
 };

// Get all questions for a Exam
const getExamDetails = async (request, response) => {
  console.log("Request in getExamQuestions -> ", request);
  const params = {
    TableName: paperQuestionsTable,
    //    IndexName: 'GSI1',
    KeyConditionExpression: 'PK = :key AND begins_with(SK, :skval)',
    ExpressionAttributeValues: {
      ':key': 'fans@gmail.com',
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
  enforceGroupMembership(['admin', 'contributor']),
  validatePathVariables(schemas.getQuestion),
  getQuestion,
);

// Get all questions for a Exam for a paperid
router.add(
  Matcher.HttpApiV2('GET', '/questions/getexam/(:paperid)'),
  enforceGroupMembership(['admin', 'student']),
  //  validatePathVariables(schemas.getQuestion),
  getExamQuestions,
);



// Create a new question for a document
// POST /questions/(:docid)
router.add(
  Matcher.HttpApiV2('POST', '/questions/addquestion/'),
  enforceGroupMembership(['admin', 'tutor']),
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
  enforceGroupMembership(['admin', 'tutor']),
  //  validateRequestBody(schemas.uploadJSON),
  createDocument,
);

//Adding users purchased courses in mycourse table
router.add(
  Matcher.HttpApiV2('POST', '/questions/addmycourses/'),
  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  addMyCoursesForUser,
);

//Create Exam
router.add(
  Matcher.HttpApiV2('POST', '/questions/createexam/'),
  enforceGroupMembership(['admin', 'tutor']),
  //  validateRequestBody(schemas.uploadJSON),
  createExam,
);

//Save Exam Result
router.add(
  Matcher.HttpApiV2('POST', '/questions/saveresult/'),
  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  saveResultBatch,
);


//getTutorPapers - Get all the papers submitted by the tutor  
router.add(
  Matcher.HttpApiV2('GET', '/questions/getpapermstr/(:paperid)'),
  enforceGroupMembership(['admin', 'tutor']),
  //  validateRequestBody(schemas.uploadJSON),
  getPaperMstr,
);


//Get MyCourses for a user
router.add(
  Matcher.HttpApiV2('GET', '/questions/getmycourses/'),
  enforceGroupMembership(['admin', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  getMyCoursesForUser,
);

//Get Top 10 papers based on ratings
router.add(
  Matcher.HttpApiV2('GET', '/questions/gettoppapers/'),
 // enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  getTopTenPapers,
);



//getExamPaper for a user
router.add(
  Matcher.HttpApiV2('GET', '/questions/getuserpapers/'),
  enforceGroupMembership(['admin', 'tutor']),
  //  validateRequestBody(schemas.uploadJSON),
  getSubmittedPapersForUser,
);

//getExamPaper for a user
router.add(
  Matcher.HttpApiV2('POST', '/questions/searchexam/'),
  enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  searchExam,
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
  enforceGroupMembership(['admin', 'tutor']),
  validatePathVariables(schemas.deleteQuestion),
  deleteQuestion,
);


//Calling updateTopTenPaperCache for testing purpose only....to be deleted and replaced with setInterval function
router.add(
  Matcher.HttpApiV2('GET', '/questions/updatecache/'),
  enforceGroupMembership(['admin', 'tutor', 'student']),
  //  validateRequestBody(schemas.uploadJSON),
  updateTopTenPaperCache,
);


// Lambda Handler
exports.handler = async (event, context) => {
  return router.run(event, context);
};
