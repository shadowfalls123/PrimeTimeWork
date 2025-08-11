import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix";

const dynamoDBPQL = AWSClients.dynamoDBPQL();

// Get total paper price from the db to verify the actual price as the prices can be altered in the api call from UI side
export const getPaperPrice = async (paperIds) => {
  try {
    const paperIdsString = paperIds.join("', '");
    console.log("PaperIdsString -> ", paperIdsString);
    const papersParams = {
      Statement: `SELECT paperprice FROM ${TABLE_NAMES.submittedPapersTable}.${tableNamePrefix}_GSI2 WHERE paperid IN ('${paperIdsString}')`,
    };

    console.log("papersParams-->>", papersParams);
    const papersResult = await dynamoDBPQL.queryPartiQL(papersParams);
    console.log("papersResult-->>", papersResult);

    // Extract numeric values from the items and calculate total price
    const totalPrice = papersResult.Items.reduce((sum, item) => {
      const price = parseFloat(item.paperprice.S);
      return sum + price;
    }, 0);

    return totalPrice;
  } catch (err) {
    console.error("getPaperPrice - Error getting paper price", err);
    throw err;
  }
};