
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

const verifyPackPaperRel = async (userid, packid, paperid) => {
    try {
      // Construct query parameters
      const params = {
        TableName: TABLE_NAMES.packageTable,
        IndexName: `${tableNamePrefix}_GSI1`, // Ensure the index is correctly configured
        KeyConditionExpression: "packageid = :packid",
        ExpressionAttributeValues: {
          ":packid": packid,
        },
        ProjectionExpression: "packagepapers",
      };
  
      console.log("Query parameters:", JSON.stringify(params, null, 2));
  
      // Perform the query
      const results = await dynamoDBExam.query(params).promise();
      console.log("Query results:", JSON.stringify(results, null, 2));
  
      // Check for results and validate packagepapers
      if (results.Items && results.Items.length > 0) {
        const packagePapers = results.Items[0].packagepapers; // Assuming only one item per packid
        console.log("Retrieved packagePapers:", packagePapers);
  
        // Validate that packagePapers is an array of objects with "S" property
        if (Array.isArray(packagePapers)) {
          const paperidIncluded = packagePapers.some(
            (paper) => paper === paperid
          );
          console.log("Is paperid included:", paperidIncluded);
          return paperidIncluded;
        } else {
          console.warn("packagePapers is not an array:", packagePapers);
          return false;
        }
      } else {
        console.log("No matching packages found for given packid.");
        return false;
      }
    } catch (error) {
      console.error("Error in verifyPackPaperRel:", error);
      throw new Error("Error verifying package-paper relationship. Please try again.");
    }
  };
  
  
  // Verfiy if the user has purchased the exam, if paperid exists in myCoursesTable then send true else false
  export const verifyUserPurchase = async (userid, packid, paperid) => {
    try {
      const packPaperRel = await verifyPackPaperRel(userid, packid, paperid);
      console.log("In verifyUserPurchase 1.0 -> packPaperRel -->> ", packPaperRel);
      if (packPaperRel) {
        console.log("In verifyUserPurchase 1.0 -> paperid -->> ", paperid);
        console.log("In verifyUserPurchase 1.0 -> userid -->> ", userid);
        const params = {
          TableName: TABLE_NAMES.myCoursesTable,
          KeyConditionExpression: "userid = :userid AND paperid = :packid",
          ExpressionAttributeValues: {
            ":userid": userid,
            ":packid": packid,
          },
          //     FilterExpression: "paperid = :paperid",
          ProjectionExpression: "paperid",
        };
  
        console.log("params in verifyUserPurchase 2.0 -> ", params);
        const results = await dynamoDBExam.query(params).promise();
  
        // If the result contains items, then the user has purchased the exam
        if (results.Items.length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
      //    return results.Items.length > 0;
    } catch (error) {
      console.error("Error verifying user purchase:", error);
      throw error;
    }
  };