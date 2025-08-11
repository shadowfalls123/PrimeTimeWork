
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { getPackageDetailsFromS3} from "./getPackageDetailsFromS3";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();


//Get student's all purchased packs. First step is to retrieve all the exam packs which the student has purchased and
// then query the submittedPapersTable to get the paper title, desc etc which will be displayed on the page
export const getMyLearningPacksFromS3 = async (request, response) => {
  try {
    console.log("getMyLearningPacksFromS3-->> 1.0 ");
    console.log("getMyLearningPacksFromS3-->> 1.0 ", request);
    const params = {
      TableName: TABLE_NAMES.myCoursesTable,
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