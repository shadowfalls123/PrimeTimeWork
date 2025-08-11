import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const getMyLearningPacksFromDB = async (request, response) => {
  try {
    console.log("getMyLearningPacksFromDB-->> 1.0 ");
    console.log("getMyLearningPacksFromDB-->> 1.0 ", request);
    const params = {
      TableName: TABLE_NAMES.packageTable,
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