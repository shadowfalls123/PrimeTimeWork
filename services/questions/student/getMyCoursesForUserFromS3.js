import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { getPaperDetailsFromS3 } from "./getPaperDetailsFromS3";
import { getPackageDetailsFromS3} from "./getPackageDetailsFromS3";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

//Get student's all purchased courses. First step is to retrieve all the exam papers which the student has purchased and then
// then query the submittedPapersTable to get the paper title, desc etc which will be displayed on the page
export const getMyCoursesForUserFromS3 = async (request, response) => {
  try {
    console.log("getMyCoursesForUser-->> 1.0 ");
    console.log("getMyCoursesForUser-->> 1.0 ", request);
    const params = {
      TableName: TABLE_NAMES.myCoursesTable,
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