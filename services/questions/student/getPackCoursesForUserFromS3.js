import { TABLE_NAMES} from "../utils/environment";
import { AWSClients } from "../../common";
import { getPaperDetailsFromS3 } from "./getPaperDetailsFromS3";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

//get Courses for user for a particular Package
export const getPackCoursesForUserFromS3 = async (request, response) => {
  try {
    console.log("getPackCoursesForUserFromS3-->> 1.0 ");
    console.log("getPackCoursesForUserFromS3-->> 1.0 ", request);
    //paperIds = request.pathVariables.packPaperIDs;
    jsonRequest = JSON.parse(request.event.body);
    paperIds = jsonRequest.packPaperIDs;
    const params = {
      TableName: TABLE_NAMES.myCoursesTable,
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