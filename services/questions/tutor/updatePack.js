import { AWSClients } from "../../common";
import { TABLE_NAMES } from "../utils/environment";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const updatePack = async (request, response) => {
  console.log("Inside updatePack request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const currentdate = new Date().toISOString();

    const params = {
      TableName: TABLE_NAMES.packageTable,
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