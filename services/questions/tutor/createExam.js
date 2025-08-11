import { AWSClients } from "../../common";
import { TABLE_NAMES } from "../utils/environment";
import { ulid } from "ulid";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const createExam = async (request, response) => {
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
      TableName: TABLE_NAMES.submittedPapersTable,
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
