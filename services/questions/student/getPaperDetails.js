
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix"; 

// Utilize the DynamoDB Document Client
const dynamoDBPQL = AWSClients.dynamoDBPQL();

// Get paper details for each paperIds. This is required for showing pper details to student for their purchased courses
export const getPaperDetails = async (paperIds) => {
    try {
      // //-----------------Keep for Reference----------------------//
      //     //Using DynamoDB API - not working (This logic works for Primary Keys and does not work for Indexs)
      //     const papersParams = {
      //       RequestItems: {
      //         [submittedPapersTable]: {
      //           Keys: [{ "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 6}, { "userid": "3c18395e-dbc9-4096-b530-8479bd3ec4a1", "paperid": 7}],
      //           ProjectionExpression: "paperid",
      // //          IndexName: `${tableNamePrefix}_GSI2`,
      //         }
      //       }
      //     };
      //     console.log("papersParams-->>", papersParams);
  
      //     // Retrieve the papers from the submittedPapers table
      //     const papersResult = await dynamoDBExam.batchGet(papersParams).promise();
      //     console.log("Data Retreived successfully ");
      // //-----------------Keep for Reference----------------------//
  
      //    using PartiQL
      //    const userId = '3c18395e-dbc9-4096-b530-8479bd3ec4a1';
      const paperIdsString = paperIds.join("', '");
      console.log("PaperIdsString -> ", paperIdsString);
      const papersParams = {
        //      Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE paperid IN (${paperIds.map(() => "?").join(",")}) AND dummycolumn = 1`,
        //      Statement: `SELECT paperid, examtitle FROM ${submittedPapersTable} WHERE paperid IN (6,7) AND userid = "3c18395e-dbc9-4096-b530-8479bd3ec4a1"`,
        Statement: `SELECT paperid, examtitle, examdesc, numofq, paperrating, reviewcount, atime FROM ${TABLE_NAMES.submittedPapersTable}.${tableNamePrefix}_GSI2 WHERE paperid IN ('${paperIdsString}')`,
  
        //      Statement: `SELECT userid FROM ${submittedPapersTable} WHERE userid = '${userId}'`
  
        //      Parameters: paperIds,
      };
  
      console.log("papersParams-->>", papersParams);
      const papersResult = await dynamoDBPQL.queryPartiQL(papersParams);
  
      // return purchasedCourses;
      return papersResult;
    } catch (err) {
      console.error(
        "getPaperDetails - Error getting submitted papers for user",
        err
      );
      throw err;
    }
  };