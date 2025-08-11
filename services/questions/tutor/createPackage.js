import { AWSClients } from "../../common";
import { TABLE_NAMES } from "../utils/environment";
import { ulid } from "ulid";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();
// Setup S3 Client
const s3 = AWSClients.s3();

export const createPackage = async (request, response) => {
  console.log("Inside createPackage request 1.0 ");
  console.log("Inside createPackage request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const timestamp = Date.now();
    const nextPackageId = ulid(timestamp);
    console.log("nextPackageId -->> ", nextPackageId);
    const packRating = 0; // Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const currentdate = new Date().toISOString();

    const params = {
      TableName: TABLE_NAMES.packageTable,
      Item: {
        userid: userid,
        packageid: nextPackageId,
        packagerating: packRating,
        packagetitle: record.packTitle,
        packagedesc: record.packDesc,
        numofp: record.numOfPapers,
        packageprice: record.packPrice,
        packagepapers: record.selectedPapers,
        reviewcount: 0,
        crtdt: currentdate,
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB createPackage Params -> ", params);

    await dynamoDBExam.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(nextPackageId),
    };
  } catch (err) {
    console.log("Error inserting data into Database:", err);
    return { statusCode: 500, body: "Error inserting data into Database" };
  }
};
