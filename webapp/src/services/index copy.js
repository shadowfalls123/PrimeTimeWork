import axios from 'axios';
//import createAuthRefreshInterceptor from 'axios-auth-refresh';
//import { Auth } from 'aws-amplify';
//import { Hub } from '@aws-amplify/core';
import Papa from 'papaparse';
import { fetchAuthSession } from '@aws-amplify/auth';

/*
const SERVICES_HOST = window.appConfig.apiEndpoint;
*/

// Determine the apiEndpoint based on the build environment
let apiEndpoint;

if (process.env.NODE_ENV === 'production') {
  apiEndpoint = window.appConfig.apiEndpointProd;
} else if (process.env.NODE_ENV === 'uat') {
  apiEndpoint = window.appConfig.apiEndpointUat; // Assuming you have a separate API endpoint for UAT
} else {
  apiEndpoint = window.appConfig.apiEndpointDev;
}

const SERVICES_HOST = apiEndpoint;

let client;

// Helper function to get the Authorization header
const getAuthHeader = async () => {
  try {
    const { tokens } = await fetchAuthSession();
    console.log("Tokens: ", tokens);
    const accessToken = tokens?.accessToken?.toString();
    if (!accessToken) {
      throw new Error("No access token available.");
    }
    return `Bearer ${accessToken}`;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

// Initialize Axios client
const createAPIClient = async () => {
  try {
    const authHeader = await getAuthHeader();

    client = axios.create({
      baseURL: SERVICES_HOST,
      headers: {
        Authorization: authHeader,
      },
    });

    // Axios interceptor to refresh tokens if needed
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn("Token expired. Refreshing...");
          try {
            const newAuthHeader = await getAuthHeader();
            error.config.headers.Authorization = newAuthHeader;
            return axios.request(error.config);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  } catch (error) {
    console.error("Error initializing API client:", error);
    throw error;
  }
};

//******************* Routes for Tutor -->> Start **************************************/

//get Exam Categories
export const getCategories = async () => {
  //#PROD console.log(`In getCategories 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getcategories/`,);
  return results;
}

//get Exam Categories
export const getSubcategories = async () => {
  //#PROD console.log(`In getSubcategories 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getsubcategories/`,);
  return results;
}

//Create Package - Create a new package which will have title, description, price and selected papers
export const createPackage = async (packageData) => {
  //#PROD console.log(`In createPackage 1 -> `);
  //#PROD console.log(`In createPackage 1.1 -> `, packageData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/createpackage/`, packageData);
  return results;
}

export const publishPack = async (packData) => {
  //#PROD console.log(`In createPackage 1 -> `);
  //#PROD console.log(`In createPackage 1.1 -> `, packageData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/publishpack/`, packData);
  return results;
}

//Create Exam - Create a new exam which will have title, description, num of questions and alloted time
export const createExam = async (examData) => {
  //#PROD console.log(`In createExam 1 -> `);
  //#PROD console.log(`In createExam 1.1 -> `, examData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/createexam/`, examData);
  return results;
}

//Update Exam - Create a new exam which will have title, description, num of questions and alloted time
export const updateExam = async (examData) => {
  //#PROD console.log(`In updateExam 1 -> `);
  //#PROD console.log(`In updateExam 1.1 -> `, examData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/updateexam/`, examData);
  return results;
}

export const updatePack = async (packData) => {
  console.log(`In updatePack 1 -> `);
  console.log(`In updatePack 1.1 -> `, packData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/updatepack/`, packData);
  return results;
}


//Publish Exam - Create a new exam which will have title, description, num of questions and alloted time
export const publishExam = async (paper, questionsData) => {
  //#PROD console.log(`In publishExam 1 -> `);
  //#PROD console.log(`In publishExam 1.1 -> `, paper, questionsData);
  if (!client) {
    await createAPIClient();
  }
  const publishExamData = {
    paper: paper,
    questionsData: questionsData
  };
  //#PROD console.log(`In publishExam 1.2 -> `, publishExamData);
  const results = await client.post(`${SERVICES_HOST}/questions/publishexam/`, publishExamData);
  return results;
};

// This function of uploadCSV is working file. It does not work when there are commas in the data so trying with Papaparse library in another function.
export const uploadCSV = async (file, paperid) => {
  if (!client) {
    await createAPIClient();
  }

  //#PROD console.log("in webapp/services/index.js ..paperid -> ", paperid);

  // //#PROD console.log("myData -> ", myData);

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async function () {
    const csvData = reader.result;
    //#PROD console.log("CSV Data -> ", csvData);

    // const response = {
    //   headers: { "Content-Type": "application/json" },
    //   body: '[{"PK":"gk","SK":"simple","question":"biggest river ?","answer":"amazon","option1":"amazon","option2":"nile","option3":"yamuna","option4":"ganga"},{"PK":"gk","SK":"simple","question":"tallest building ?","answer":"burj khalifa","option1":"eiffel tower","option2":"burj khalifa","option3":"Tokyo Skytree","option4":"Kuala Lumpur Tower"}]'
    // };

    // const parsedBody = JSON.parse(response.body);
    // const jsonResponse = { headers: response.headers, body: parsedBody };
    // //#PROD console.log("jsonResponse --> ", jsonResponse);

    const rows = csvData.split('\n').map(row => row.trim());
    const headers = rows[0].split(',').map(header => header.trim());

    const jsonRows = [];
    const omittedRows = [];
    //let jsonRowsStr = "";


    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      const row = {};

      // Check if any value is blank or undefined
      let isBlank = false;
      for (let j = 0; j < headers.length; j++) {
        if (!values[j] || values[j] === '') {
          isBlank = true;
          break;
        }
      }

      // If any value is blank or undefined, add the row to the omittedRows array
      if (isBlank) {
        omittedRows.push(values);
      } else {
        // If no value is blank or undefined, add the row to the jsonRows array
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = values[j];
        }
        row['paperid'] = paperid;
        jsonRows.push(row);
        //        jsonRowsStr = JSON.parse(jsonRows)
        //        jsonRowsStr = JSON.stringify(jsonRows);
      }
      //#PROD console.log("JSON Data -> ", jsonRows);
      //#PROD console.log("Stringified JSON Data -> ", JSON.stringify(jsonRows));
      //#PROD console.log("omittedRows Data -> ", omittedRows);
      //      //#PROD console.log("jsonRowsStr Data -> ", jsonRowsStr);

    }
    try {
      const paperData = {
        //        paperid: paperid,
        uploadData: jsonRows
      };

      await client.post(`${SERVICES_HOST}/questions/upload/`, {
        //data: JSON.parse(jsonRows)
        headers: { "Content-Type": "application/json" },
        //  data: JSON.stringify(data)
        data: paperData
        // paperTitle: paperTitle, 
        // paperDescription: paperDescription, 
        // numQuestions: numQuestions, 
        // allottedTime: allottedTime,
        //  data: jsonRows
      });

      // const result = await client.post(`http://localhost:4684/api/data`, {
      //   //data: JSON.parse(jsonRows)
      //   headers: { "Content-Type": "application/json" },
      //   data: jsonRows
      // });

      //  const result = await client.post(`http://localhost:4684/api/data`, {
      //         data: jsonRows
      //     });
      //#PROD console.log(`Result from Upload: ${JSON.stringify(result)}`);
    } catch (error) {
      //#PROD console.log(`Error while uploading file: ${error}`);
    }
  };
};

// index.js
export const uploadCSVData = async (file, paper) => {
  console.log("uploadCSVData paper -->> ", paper);
  const paperid = paper.pid; 
  if (!client) {
    await createAPIClient();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = async function () {
      try {
        const csvData = reader.result;

        const results = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        // Validate schema
        const headers = results.meta.fields;
        const expectedHeaders = ["question", "answer", "option1", "option2", "option3", "option4", "answerExplanation", "section", "marks", "negativeMarks"];
        const isValidSchema = headers.length === expectedHeaders.length &&
          headers.every((value, index) => value === expectedHeaders[index]);

        if (!isValidSchema) {
          throw new Error("Invalid CSV schema. Headers must have: question, answer, option1, option2, option3, option4, answerExplanation, section, marks, negativeMarks");
        }

        if (results.data.length > 30) {
          throw new Error("Number of records exceeds the limit (30)");
        }

        // Validate sections
        const validSections = paper.sections.map(section => section.name);

        const invalidSections = results.data.filter(row => !validSections.includes(row.section));
        if (invalidSections.length > 0) {
          throw new Error(`Invalid section names in CSV. Valid sections: ${validSections.join(", ")}. To add new sections, edit the paper before uploading.`);
        }

        // Additional validations for field lengths and character limits
        const invalidRecords = results.data.filter(row => {
          const questionLength = row.question.length > 500;
          const answerLength = row.answer.length > 100;
          const option1Length = row.option1.length > 100;
          const option2Length = row.option2.length > 100;
          const option3Length = row.option3.length > 100;
          const option4Length = row.option4.length > 100;
          const explanationLength = row.answerExplanation.length > 1000;
          const sectionLength = row.section.length > 100;
          const marksValid = !isNaN(row.marks) && row.marks >= 0;
          const negativeMarksValid = !isNaN(row.negativeMarks);

          return questionLength || answerLength || option1Length || option2Length || option3Length || option4Length || explanationLength || sectionLength || !marksValid || !negativeMarksValid;
        });

        if (invalidRecords.length > 0) {
          throw new Error("Some records exceed character limits");
        }

        // Check total questions count
        const getQuestionsCountResponse = await getQuestionsCount(paperid); // Fetch the count of existing questions
        const existingQuestionsCount = getQuestionsCountResponse.data.count;
        console.log("existingQuestionsCount -->> ", existingQuestionsCount);
        const fileQuestionsCount = results.data.length;
//        console.log("fileQuestionsCount -->> ", fileQuestionsCount);

//        console.log("parseInt(paper.qcount) -->> ", parseInt(paper.qcount));

        if (existingQuestionsCount + fileQuestionsCount > parseInt(paper.qcount)) {
          throw new Error(`Total number of questions exceeds the allowed count of ${paper.qcount} as defined for the paper. Existing questions: ${existingQuestionsCount}, Uploaded questions: ${fileQuestionsCount}`);
        }

        const jsonRows = results.data.map(row => {
          const stringRow = {};
          for (const key in row) {
            stringRow[key] = String(row[key]);
          }
          return { ...stringRow, paperid: String(paperid) };
        });

        const paperData = {
          uploadData: jsonRows
        };

        await client.post(`${SERVICES_HOST}/questions/upload/`, {
          headers: { "Content-Type": "application/json" },
          data: paperData,
        });

        resolve(); // Resolve the promise on successful upload

      } catch (error) {
        reject(error); // Reject the promise on validation or upload error
      }
    };

    reader.onerror = function () {
      reject(new Error("File reading error"));
    };
  });
};


// This function of uploadCSV is working file. It does not work when there are commas in the data so trying with Papaparse library in another function.
export const Old_uploadCSVData = async (file, paperid) => {
  if (!client) {
    await createAPIClient();
  }

  //#PROD console.log("in webapp/services/index.js ..paperid -> ", paperid);

  const reader = new FileReader();
  //  reader.readAsText(file);
  reader.readAsText(file, "UTF-8");
  reader.onload = async function () {
//commenting try catch and hence all errros will be handled by the calling function 
//    try {
      const csvData = reader.result;
      //#PROD console.log("CSV Data -> ", csvData);

      const results = Papa.parse(csvData, {
        header: true, // Treat first row as header row
        skipEmptyLines: true, // Skip empty lines
        dynamicTyping: true, // Automatically convert numbers and booleans
      });

      //Validate schema
      const headers = results.meta.fields;
      const expectedHeaders = ["question", "answer", "option1", "option2", "option3", "option4", "answerExplanation", "section", "marks", "negativeMarks"];
      const isValidSchema = headers.length === expectedHeaders.length &&
        headers.every((value, index) => value === expectedHeaders[index]);

        if (!isValidSchema) {
//          alert("invalid schema");
          throw new Error("Invalid CSV schema. Headers must be: question, answer, option1, option2, option3, option4, answerExplanation, section, marks, negativeMarks");
        }
  
        if (results.data.length > 30) {
          throw new Error("Number of records exceeds the limit (30)");
        }

      // //#PROD console.log("Number of records in the CSV is -->> ", results.data.length);
      // if (!isValidSchema) {
      //   console.error("Invalid CSV schema. Headers must be: question, answer, option1, option2, option3, option4, answerExplanation, section, marks, negativeMarks");
      //   alert("Invalid CSV schema. Headers must be: question, answer, option1, option2, option3, option4, answerExplanation, section, marks, negativeMarks");
      //   return;
      // }

      // // Validate number of records
      // if (results.data.length > 30) {
      //   console.error("Number of records exceeds the limit (30)");
      //   return;
      // }

      // Validate character limits for each field
      const invalidRecords = results.data.filter(row => {
        const questionLength = row.question.length > 500;
        const answerLength = row.answer.length > 100;
        const option1Length = row.option1.length > 100;
        const option2Length = row.option2.length > 100;
        const option3Length = row.option3.length > 100;
        const option4Length = row.option4.length > 100;
        const explanationLength = row.answerExplanation.length > 1000;
        const sectionLength = row.section.length > 100; // Max length for section field
        const marksValid = !isNaN(row.marks) && row.marks >= 0; // Marks field should be a non-negative number
        const negativeMarksValid = !isNaN(row.negativeMarks); // NegativeMarks field should be a number

        return questionLength || answerLength || option1Length || option2Length || option3Length || option4Length || explanationLength || sectionLength || !marksValid || !negativeMarksValid;
      });

      if (invalidRecords.length > 0) {
        throw new Error("Some records exceed character limits");
      }

      // if (invalidRecords.length > 0) {
      //   console.error("Some records exceed character limits");
      //   alert("Some records exceed character limits");
      //   return;
      // }

      // const OldjsonRows = results.data.map(row => ({ ...row, paperid }));
      //#PROD console.log("OldjsonRows Data -> ", OldjsonRows);

      const jsonRows = results.data.map((row) => {
        const stringRow = {};
        for (const key in row) {
          stringRow[key] = String(row[key]);
        }
        return { ...stringRow, paperid: String(paperid) }; //converting all the values as strings
      });

      //#PROD console.log("JSON Data -> ", jsonRows);
      //#PROD console.log("Stringified JSON Data -> ", JSON.stringify(jsonRows));
      // //#PROD console.log("omittedRows Data -> ", omittedRows);
      //      //#PROD console.log("jsonRowsStr Data -> ", jsonRowsStr);

      //#PROD console.log("In uploadCSVData try .....");
      const paperData = {
        uploadData: jsonRows
      };
      console.log("paperData -->> ", paperData);
      await client.post(`${SERVICES_HOST}/questions/upload/`, {
        headers: { "Content-Type": "application/json" },
        data: paperData,
      });
      //#PROD console.log(`Result from Upload: ${JSON.stringify(result)}`);
//    } catch (error) {
//      //#PROD console.log(`Error while uploading file: ${error}`);
//      throw error; // Throw error to be caught by handleUpload
//    }
  };
};

//get Count of questions for a paper
export const getQuestionsCount = async (pid) => {
  //#PROD console.log(`In getQuestionsCount 1 -> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getquestionscount/${pid}`,);
  return results;
}


//get SP questions for a paper
export const getSPQuestions = async (pid) => {
  //#PROD console.log(`In getSPQuestions 1 -> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getspquestions/${pid}`,);
  return results;
}

//get question's associated image
export const getQuestionImage = async (pid, qid) => {
  //#PROD console.log(`In getSPQuestions 1 -> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getquestionimg/${pid}/${qid}`,);
  return results;
}

//get SP questions for a paper
export const getSPQuestionsReviewAns = async (pid, packid) => {
  //#PROD console.log(`In getSPQuestionsReviewAns 1 -> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getspquestionsreviewans/${pid}/${packid}`,);
  return results;
}


// Add a new question for a exam
export const addQuestion = async (questionData) => {
  //#PROD console.log(`in Webapp Services addQuestion: questionData -> `, questionData, " options[0] -> ", questionData.options[0]);
  if (!questionData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }
  const qData = {
    question: questionData.question,
    answer: questionData.selectedOption,
    option1: questionData.options[0],
    option2: questionData.options[1],
    option3: questionData.options[2],
    option4: questionData.options[3],
    answerExplanation: questionData.answerExplanation,
    paperid: questionData.paperid,
    section: questionData.selectedSection,
    marks: questionData.marks,
    negativeMarks: questionData.negativeMarks,
    image: questionData.images, // Include the Base64 encoded image
  };
  // //#PROD console.log(`body content is -> `, body);
  //#PROD console.log(" Calling webservice............");
  await client.post(`${SERVICES_HOST}/questions/addquestion/`, qData);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
};

// Add a new question for a exam
export const updateQuestion = async (questionData) => {
  console.log(`in Webapp Services updateQuestion: questionData -> `, questionData);
  if (!questionData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }

  const qData = {
    question: questionData.updatedQuestion,
    answer: questionData.selectedOption,
    option1: questionData.updatedOptions[0],
    option2: questionData.updatedOptions[1],
    option3: questionData.updatedOptions[2],
    option4: questionData.updatedOptions[3],
    answerExplanation: questionData.updatedAnswerExplanation,
    pid: questionData.paperid,
    quesid: questionData.questionID,
    selectedSection: questionData.selectedSection,
    marks: questionData.marks,
    negativeMarks: questionData.negativeMarks,
    image: questionData.combinedImages,
  };
  console.log(`qData content is -> `, qData);
  //#PROD console.log(" Calling webservice............");
  await client.post(`${SERVICES_HOST}/questions/updatequestion/`, qData);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
};

//get submitted ExamPaper for a user
export const getSubmittedPapers = async () => {
  //#PROD console.log(`In getSubmittedPapersForUser 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getuserpapers/`,);
  return results;
}



//Delete submitted ExamPaper for a user.
export const deletePaper = async () => {
  //#PROD console.log(`In deletePaper 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.delete(`${SERVICES_HOST}/questions/deletepaper/`,);
  return results;
};

export const deleteUserProfileImage = async () => {
  console.log("In deleteUserProfileImage 1 -> ");
  if (!client) {
    await createAPIClient();
  }

  try {
    const response = await client.delete(`${SERVICES_HOST}/questions/deleteprofileimage/`);
    console.log("In deleteUserProfileImage 2", response);
    return response.data; // Assuming the API returns a data object
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw new Error("Failed to delete profile image");
  }
};


//******************* Routes for Tutor -->> End **************************************/


//******************* Routes for Student -->> Start **************************************/

//Adding users purchased courses in mycourse table
export const addMyCourses = async (myCourseData) => {
  //#PROD console.log(`in Webapp Services addMyCourses 1.0 `, myCourseData);
  if (!myCourseData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }
  // const courseData = {
  //   purchaseprice: myCourseData.paperprice,
  //   paperid: myCourseData.paperid
  // };
  // //#PROD console.log(`body content is -> `, body);
  //  //#PROD console.log(" Calling webservice............", myCourseData);
  const results = await client.post(`${SERVICES_HOST}/questions/addmycourses/`, myCourseData);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
  return results;

};

//Get MyCourses for a user - Get users purchased courses
export const getMyCoursesForUser = async () => {
  console.log(`In getMyCoursesForUser 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getmycourses/`);
  console.log("In getMyCoursesForUser 2", results);
  return results;
}

// //Get MyCourses for a user - Get users purchased courses
// export const getPackCoursesForUser = async (packPaperIDs) => {
//   console.log(`In getPackCoursesForUserFromS3 1 packPaperIDs --> `, packPaperIDs);
//   if (!client) {
//     await createAPIClient();
//   }
//     // Modify the packPaperIDs to separate them by commas instead of slashes
//     const formattedPackPaperIDs = packPaperIDs.join('/');

//   const results = await client.get(`${SERVICES_HOST}/questions/getpackcourses/${formattedPackPaperIDs}`);
//   console.log("In getPackCoursesForUserFromS3 2", results);
//   return results;
// }

export const getPackCoursesForUser = async (packPaperIDs) => {
  console.log(`In getPackCoursesForUserFromS3 1 packPaperIDs --> `, packPaperIDs);
  if (!client) {
    await createAPIClient();
  }
  const packagePaperIDs = {
    packPaperIDs
  };

  const results = await client.post(`${SERVICES_HOST}/questions/getpackcourses/`, packagePaperIDs);
  console.log("In getPackCoursesForUserFromS3 2", results);
  return results;
}

export const getPackDetails = async (paperids) => {
  console.log(`In getPackDetails 1 packid --> `, paperids);
  if (!client) {
    await createAPIClient();
  }

  const packpaperids = {
    paperids
  };

  const results = await client.post(`${SERVICES_HOST}/questions/getpackpapdtls/`, packpaperids);
  console.log("In getPackDetails 2", results.data);
  return results.data;
}

//Get MyCourses for a user - Get users purchased courses
export const getMyLearningPacks = async () => {
  //#PROD console.log(`In getMyCoursesForUser 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getmylearningpacks/`,);
  console.log("In getMyLearningPacks 2", results);
  return results;
}

export const getTutorLearningPacks = async () => {
  //#PROD console.log(`In getMyCoursesForUser 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/gettutorpacks/`,);
  console.log("In getTutorLearningPacks 2", results);
  return results;
}

//Get users wallet credits
export const getMyCredits = async () => {
  //#PROD console.log(`In getMyCredits 1 -> `);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/questions/getmycredits/`);
  //#PROD console.log("In getMyCredits 2");
  //#PROD console.log("Results -> ", results);
  return results;
}

// Get Questions for exam for a paperid -------------------------------------------------
export const getExamQuestions = async (paperid, packid) => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/getexam/${paperid}/${packid}`);
  //#PROD console.log("Questions Data -> ", data);
  return data;
};

export const saveResult = async (resultData) => {
  //#PROD console.log(`In saveResult 1 -> `);
  //#PROD console.log(`In saveResult 1.1 -> `, resultData);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/saveresult/`, resultData);
  console.log("saveResults ----- Results -> ", results);
  return results;
}

export const saveUserFeedback = async (userFeedback) => {
  //#PROD console.log(`In saveResult 1 -> `);
  //#PROD console.log(`In saveResult 1.1 -> `, userFeedback);
  if (!client) {
    await createAPIClient();
  }
  const results = await client.post(`${SERVICES_HOST}/questions/saveuserfeedback/`, userFeedback);
  return results;

}

// Get Questions for exam for a paperid -------------------------------------------------
export const getUserFeedback = async (pid) => {
  //#PROD console.log(`In getUserFeedback 1 pid is -->> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/getuserfeedback/${pid}`);
  console.log("User Feedback Data -> ", data);
  return data;
};

// Get questions and answers for students exam review -------------------------------------------------
export const getMyExamReview = async (pid) => {
  //#PROD console.log(`In getMyExamReview 1 pid is -->> `, pid);
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/getmyexamreview/${pid}`);
  console.log("Exam Review Data -> ", data);
  return data;
};

//******************* Routes for Student -->> End **************************************/

//******************* Common Routes -->> Start **************************************/

//******************* User Profile Management **************************************/

// Update/Save user profile
export const createUserProfile = async (userProfileData) => {
  //#PROD console.log(`in Webapp Services createUserProfile 1.0 -->> userProfileData `, userProfileData);
  if (!userProfileData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }
  //#PROD console.log("userProfileData -->> ", userProfileData);
  const profileData = {
    firstname: userProfileData.firstname,
    lastname: userProfileData.lastname,
    useremail: userProfileData.useremail
  };
  //#PROD console.log(" Calling createUserProfile webservice............profileData is -->> ", profileData);
  //  const results = await client.post(`${SERVICES_HOST}/questions/createuserprofile/`, profileData);
  //  //#PROD console.log(`Results: ${JSON.stringify(results.data)}`);
  try {
    const results = await client.post(`${SERVICES_HOST}/questions/createuserprofile/`, profileData);

    console.log(`Results: ${JSON.stringify(results.data)}`);

    if (results && results.data) {
      return results.data; // Return the response data
    } else {
      throw new Error('Invalid response from the server');
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error; // Throw the error for further handling in the caller function
  }
};

// Update/Save user profile Image
export const updateUserProfileImage = async (userProfileData) => {
  //const profileimage = userProfileImage.profileimage;
  console.log(`in Webapp Services updateUserProfile 1.0 -->> userProfileImage `, userProfileData);
  if (!userProfileData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }
  const profileData = {
    //    firstname: userProfileData.firstname,
    profileImage: userProfileData
  };
  console.log(" In userProfileImage.... Calling webservice............profileData is -->> ", profileData);
  const results = await client.post(`${SERVICES_HOST}/questions/updateuserprofileimage/`, profileData);
  //#PROD console.log(`Results: ${JSON.stringify(results.data)}`);
  return results;
};


// Update/Save user profile
export const updateUserProfile = async (userProfileData) => {
  //#PROD console.log(`in Webapp Services updateUserProfile 1.0 -->> userProfileData `, userProfileData);
  if (!userProfileData) {
    //#PROD console.log("In error - No data");
    throw new Error('Must have data');
  }
  if (!client) {
    await createAPIClient();
  }
  //#PROD console.log("userProfileData -->> ", userProfileData);
  const profileData = {
    firstname: userProfileData.firstname,
    lastname: userProfileData.lastname,
    useremail: userProfileData.useremail,
    countrycode: userProfileData.countrycode,
    countryname: userProfileData.countryname,
    //   profileimage: userProfileData.profileImage
    briefDescription: userProfileData.briefDescription,
    isTutor: userProfileData.isTutor,
    qualifications: userProfileData.qualifications,
  };
  //#PROD console.log(" Calling webservice............profileData is -->> ", profileData);
  const results = await client.post(`${SERVICES_HOST}/questions/updateuserprofile/`, profileData);
  //#PROD console.log(`Results: ${JSON.stringify(results.data)}`);
  return results;
};

// Get user profile -------------------------------------------------
export const getUserProfile = async () => {
  //#PROD console.log("In webservice - getUserProfile  -> ");
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/getuserprofile/`);
  console.log("User Profile  -> ", data);
  return data;
};

// Get top 10 rated papers -------------------------------------------------
export const getTopRatedPackages = async () => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/gettoppackages/`);
  console.log("Top 10 Packages  -> ", data);
  return data;
};

// Get top 10 rated papers -------------------------------------------------
export const getTopRatedPapers = async () => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/gettoppapers/`);
  //#PROD console.log("Top 10 Papers  -> ", data);
  return data;
};

//Search exam based on search text
export const searchExam = async (searchText) => {
  //#PROD console.log(`In getSearchedPapers searchText -> `, searchText);
  if (!client) {
    await createAPIClient();
  }
  // Convert to JSON format
  const searchTextJson = {
    searchText: searchText
  };

  const { data } = await client.post(`${SERVICES_HOST}/questions/searchexam/`, searchTextJson);
  return data;
};

//Search exam based on search text
export const searchPack = async (searchText) => {
  console.log(`In getSearchedPapers searchText -> `, searchText);
  if (!client) {
    await createAPIClient();
  }
  // Convert to JSON format
  const searchTextJson = {
    searchText
  };

  const { data } = await client.post(`${SERVICES_HOST}/questions/searchpack/`, searchTextJson);
  return data;
};

//Contact Us message
export const saveContactUsMessage = async (contactusrecord) => {
  //#PROD console.log(`In saveContactUsMessage contactusrecord -> `, contactusrecord);
  if (!client) {
    await createAPIClient();
  }
  // Convert to JSON format
  const contactusjson = {
    contactusrecord: contactusrecord
  };

  const { data } = await client.post(`${SERVICES_HOST}/questions/contactus/`, contactusjson);
  return data;
};


//******************* Common Routes -->> End **************************************/

/*
// Questions -------------------------------------------------
export const getQuestions = async () => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/questions/`);
  //#PROD console.log("Questions Data -> ", data);
  return data;
};

*/






























// export const uploadCSV = async (name, tags, file) => {
//   if (!client) {
//     await createAPIClient();
//   }
//   //#PROD console.log("in webapp/services/index.js ..filename -> ", name, " fileTags -> " ,tags, " file -> " , file);

//   const reader = new FileReader();
//   reader.readAsText(file);
//   reader.onload = async function () {
//     const csvData = reader.result;
//     //#PROD console.log("CSV Data -> ", csvData);

//   //  const rows = csvData.split('\n');
// //    const headers = rows[0].split(',');
//     const rows = csvData.split('\n').map(row => row.trim());  
//     const headers = rows[0].split(',').map(header => header.trim());


//     // const jsonRows = [];
//     // for (let i = 1; i < rows.length; i++) {
//     //   const values = rows[i].split(',');
//     //   const row = {};
//     //   for (let j = 0; j < headers.length; j++) {
//     //     row[headers[j]] = values[j];
//     //   }
//     //   jsonRows.push(row);
//     // }
//     // //#PROD console.log("JSON Data -> ", jsonRows);

//     const jsonRows = [];
//     const omittedRows = [];

//     for (let i = 1; i < rows.length; i++) {
//       const values = rows[i].split(',');
//       const row = {};

//       // Check if any value is blank or undefined
//       let isBlank = false;
//       for (let j = 0; j < headers.length; j++) {
//         if (!values[j] || values[j] === '') {
//           isBlank = true;
//           break;
//         }
//       }

//       // If any value is blank or undefined, add the row to the omittedRows array
//       if (isBlank) {
//         omittedRows.push(values);
//       } else {
//         // If no value is blank or undefined, add the row to the jsonRows array
//         for (let j = 0; j < headers.length; j++) {
//           row[headers[j]] = values[j];
//         }
//         jsonRows.push(row);
//       }
//         //#PROD console.log("JSON Data -> ", jsonRows);
//         //#PROD console.log("omittedRows Data -> ", omittedRows);

//     }

//     try {
// //      const result = await client.post(`${SERVICES_HOST}/questions/`, {
//      const result = await client.post(`http://localhost:4000/api/data`, {
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         data: jsonRows
//       });

//       //#PROD console.log(`Result from Upload: ${JSON.stringify(result)}`);
//     } catch (error) {
//       //#PROD console.log(`Error while uploading file: ${error}`);
//     }
//   };
// };


// File1 Webapp calling file
// export const uploadCSV = async (name, tags, file) => {
//   if (!client) {
//     await createAPIClient();
//   }

//   // Use FileReader API to read file contents and display on console for debugging
//   const reader = new FileReader();
//   reader.readAsText(file);
//   reader.onload = async function() {
//     const fileContent = reader.result;
//     //#PROD console.log("reader.result -> ",reader.result);

//     const formData = new FormData();
//     formData.append('name', name);
//     formData.append('tags', tags); 
//     formData.append('file', new Blob([fileContent], { type: file.type }));

//     //#PROD console.log("formData.get('file') -> ", formData.get('file'));

//     try {
//       const result = await client.post(`${SERVICES_HOST}/questions/`, formData);
//       //#PROD console.log(`Result from Upload: ${JSON.stringify(result)}`);
//     } catch (error) {
//       //#PROD console.log(`Error while uploading file: ${error}`);
//     }
//   };
// };


/*
// Documents ---------------------------------------------------------

export const getAllDocuments = async () => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/documents/`);
  return data;
};

export const getDocument = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const { data } = await client.get(`${SERVICES_HOST}/documents/${id}`);
  //#PROD console.log(`Data: ${JSON.stringify(data)}`);
  return data;
};

export const deleteDocument = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/documents/${id}`);
};

export const uploadDocument = async (name, tags, file) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  formData.append('name', name);
  formData.append('tags', tags.join(','));
  formData.append('file', file);

  const result = await client.post(`${SERVICES_HOST}/documents/`, formData);
  //#PROD console.log(`Result from Upload: ${JSON.stringify(result)}`);
};

*/

// Users

let userProfileData;

export const getAllUsers = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/`);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
  return results.data.users;
};

export const createNewUser = async (email, name, group) => {
  if (!client) {
    await createAPIClient();
  }
  const body = { email, name, group };
  //#PROD console.log(`Body: ${JSON.stringify(body)}`);
  await client.post(`${SERVICES_HOST}/users/`, body);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
};

export const deleteUser = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  await client.delete(`${SERVICES_HOST}/users/${id}`);
};

export const getAllUserProfiles = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/profiles`);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
  return results.data.users;
};

export const getProfileData = async (userId, forceRefresh = false) => {
  if (!userProfileData || forceRefresh) {
    userProfileData = await getAllUserProfiles();
    //#PROD console.log(`User Profile Data: ${JSON.stringify(userProfileData)}`);
  }
  const user = userProfileData.find((u) => u.userId === userId);
  return user;
};

export const getCurrentUserProfile = async () => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/users/profile`);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
  return results.data.user;
};

export const updateCurrentUserProfile = async (name, shouldDeletePicture, picture) => {
  if (!client) {
    await createAPIClient();
  }
  const formData = new FormData();
  if (name) {
    formData.append('name', name);
  }
  if (shouldDeletePicture) {
    formData.append('deletePicture', true);
  }
  if (picture) {
    formData.append('picture', picture);
  }
  const results = await client.patch(`${SERVICES_HOST}/users/profile`, formData);
  //#PROD console.log(`In webapp/services/index.js Results: ${JSON.stringify(results)}`);
  return results.data.user;
};

// Comments --------------------------------------------------------------

// export const createComment = async (id, content) => {
//   //#PROD console.log(`[MOCK] Create Comment - Document ID ${id} Comment: ${content}`);
//   return mock.mockCall(mock.createComment(id, content), 1000);
// };

// export const getCommentsForDocument = async (id) => {
//   //#PROD console.log(`[MOCK] Get comments for document ${id}`);
//   return mock.mockCall(mock.getCommentsForDocument(id), 1000);
// };

// Comments --------------------------------------------------------------

export const createComment = async (id, content) => {
  if (!id) {
    throw new Error('Must have document ID');
  }
  if (!client) {
    await createAPIClient();
  }
  const body = {
    Comment: content,
  };
  await client.post(`${SERVICES_HOST}/comments/${id}`, body);
  //#PROD console.log(`Results: ${JSON.stringify(results)}`);
};

export const getCommentsForDocument = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const results = await client.get(`${SERVICES_HOST}/comments/${id}`);
  const sortedResults = results.data.sort((a, b) => new Date(b.DateAdded) - new Date(a.DateAdded));
  return sortedResults;
};

export const reportCommentForModeration = async (id) => {
  if (!client) {
    await createAPIClient();
  }
  const body = {
    CommentId: id,
  };
  await client.post(`${SERVICES_HOST}/moderate/`, body);
};

/* eslint-enable no-console */
