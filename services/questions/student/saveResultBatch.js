import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { analyzePersonalityAssessment } from "../tutor/PersonalityReports/personalityReports";
import { getExamQuestionsChildForTutorFromS3 } from "../tutor/getExamQuestionsChildForTutorFromS3";
import { generateHPIReport } from "../tutor/PersonalityReports/hpiReport";
import { getAnswersforPaper } from "./getAnswersforPaper";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const saveResultBatch = async (request, response) => {
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
      const hoganPersonalityReportData = await generateHPIReport(examUserAnswers, jsonParsedExamQuestionDetails);
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
      TableName: TABLE_NAMES.examResultsHistoryTable,
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
            [TABLE_NAMES.examResultsTable]: batch.map((record) => ({
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
      TableName: TABLE_NAMES.myCoursesTable, // Replace with your actual user table name
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