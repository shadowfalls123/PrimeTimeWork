import { AWSClients } from "../../common";
import { TABLE_NAMES } from "../utils/environment";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const updateExam = async (request, response) => {
  console.log("Inside updateExam request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const currentdate = new Date().toISOString();

    const params = {
      TableName: TABLE_NAMES.submittedPapersTable,
      Key: {
        userid: userid,
        paperid: record.pid, // Assuming pid is used to identify the exam to update
      },
      UpdateExpression: `
        SET examtitle = :examtitle,
            examdesc = :examdesc,
            numofq = :numofq,
            atime = :atime,
            paperprice = :paperprice,
            cat = :cat,
            subcat = :subcat,
            subcatl2 = :subcatl2,
            difflvl = :difflvl,
            updatedt = :updatedt,
            sections = :sections
      `,
      ExpressionAttributeValues: {
        ":examtitle": record.papertitle,
        ":examdesc": record.paperdesc,
        ":numofq": record.qcount,
        ":atime": record.examtime,
        ":paperprice": record.price,
        ":cat": record.category,
        ":subcat": record.subcategory,
        ":subcatl2": record.subcategorylvl2,
        ":difflvl": record.difflvl,
        ":sections": record.sections,
        ":updatedt": currentdate,
      },
      ReturnValues: "ALL_NEW", // Return the updated item
    };

    console.log("DynamoDB updateExam Params -> ", params);

    const results = await dynamoDBExam.update(params).promise();
    console.log("results is -->> ", results);
    return { statusCode: 200, body: "Data updated successfully." };
  } catch (err) {
    console.log("Error updating exam data in Database:", err);
    return { statusCode: 500, body: "Error updating exam data in Database" };
  }
};