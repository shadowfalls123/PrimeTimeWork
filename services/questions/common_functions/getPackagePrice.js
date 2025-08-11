
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { tableNamePrefix } from "../utils/getTableNamePrefix";

const dynamoDBPQL = AWSClients.dynamoDBPQL();

// Get total package price from the db to verify the actual price as the prices can be altered in the api call from UI side
export const getPackagePrice = async (packageIds) => {
  try {
    const packageIdsString = packageIds.join("', '");
    console.log("packageIdsString -> ", packageIdsString);
    const packagesParams = {
      Statement: `SELECT packageprice FROM ${TABLE_NAMES.packageTable}.${tableNamePrefix}_GSI1 WHERE packageid IN ('${packageIdsString}')`,
    };

    console.log("packagesParams-->>", packagesParams);
    const packagesResult = await dynamoDBPQL.queryPartiQL(packagesParams);
    console.log("packagesResult-->>", packagesResult);

    // Extract numeric values from the items and calculate total price
    const totalPrice = packagesResult.Items.reduce((sum, item) => {
      const price = parseFloat(item.packageprice.S);
      return sum + price;
    }, 0);

    return totalPrice;
  } catch (err) {
    console.error("Error getting Package price", err);
    throw err;
  }
};