import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Get all submitted papers for a user
export const getSubmittedPapersForUser = async (request, response) => {
  const params = {
    TableName: TABLE_NAMES.submittedPapersTable,
    KeyConditionExpression: "userid = :userId",
    ExpressionAttributeValues: {
      ":userId": request.event.requestContext.authorizer.jwt.claims.username,
    },
    ProjectionExpression:
      "examdesc, numofq, paperprice, atime, cat, subcat, difflvl, subcatl2, paperid, examtitle, paperrating, reviewcount, sections",
  };

  try {
    const result = await dynamoDBExam.query(params).promise();

    // Obfuscate column names before sending in the API response
    const obfuscatedResults = result.Items.map((item) =>
      obfuscateColumnNamesGSPU(item)
    );

    return obfuscatedResults;
  } catch (err) {
    console.error(
      "getSubmittedPapersForUser - Error getting submitted papers for user",
      err
    );
    throw err;
  }
};


// Function to obfuscate column names
const obfuscateColumnNamesGSPU = (item) => {
    const obfuscatedMapping = {
      examdesc: "paperdesc",
      numofq: "qcount",
      paperprice: "price",
      atime: "examtime",
      cat: "category",
      subcat: "subcategory",
      difflvl: "difflvl",
      subcatl2: "subcategorylvl2",
      paperid: "pid",
      examtitle: "papertitle",
      paperrating: "rating",
      reviewcount: "noofreviews",
      sections: "sections",
    };
  
    const obfuscatedItem = {};
    Object.keys(item).forEach((key) => {
      if (obfuscatedMapping[key]) {
        obfuscatedItem[obfuscatedMapping[key]] = item[key];
      }
    });
  
    return obfuscatedItem;
  };