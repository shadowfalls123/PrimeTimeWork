import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

//Get top 10 papers based on top ratings
export const getTopTenPapersFromSubmittedPaperTab = async () => {
  try {
    const params = {
      TableName: TABLE_NAMES.submittedPapersTable,
      IndexName: `${tableNamePrefix}_GSI1`,
      KeyConditionExpression:
        "#rating >= :rating AND #dummycolumn = :dummycolumn",
      ExpressionAttributeNames: {
        "#rating": "paperrating",
        "#dummycolumn": "dummycolumn",
      },
      ExpressionAttributeValues: {
        ":rating": 0,
        ":dummycolumn": 1,
        ":published": 1, // Condition to check if the paper is published. published=1 means the paper is published
      },
      FilterExpression: "published = :published",
      ProjectionExpression:
        "paperid, examtitle, examdesc, paperrating, noofreviews, paperprice, cat, subcat, difflvl, subcatl2",
      Limit: 10,
      ScanIndexForward: false, //By default, the sort order is ascending. To reverse the order, set the ScanIndexForward parameter to false
    };

    const result = await dynamoDBExam.query(params).promise();
    if (result.Items && result.Items.length > 0) {
      // Obfuscate column names before sending to frontend
      const obfuscatedResults = result.Items.map((item) =>
        obfuscateColumnNamesTopTenPapers(item)
      );
      console.log("obfuscatedResults -> ", obfuscatedResults);
      return obfuscatedResults;
    } else {
      return []; // Return an empty array when no records are found
    }

    //return result.Items;
  } catch (err) {
    console.error("CME GTTP01 - Error getting submitted papers for user", err);
    throw err;
  }
};


const obfuscateColumnNamesTopTenPapers = (data) => {
    const obfuscatedKeys = {
      paperid: "pid",
      examtitle: "papertitle",
      examdesc: "paperdesc",
      paperrating: "rating",
      paperprice: "price",
      cat: "category",
      subcat: "subcategory",
      difflvl: "difflvl",
      subcatl2: "subcategorylvl2",
      reviewcount: "noofreviews",
      // Add more mappings as needed for other columns
    };
  
    const transformedData = {};
    Object.keys(data).forEach((key) => {
      if (obfuscatedKeys[key]) {
        transformedData[obfuscatedKeys[key]] = data[key];
      } else {
        transformedData[key] = data[key];
      }
    });
    return transformedData;
  };