import { TABLE_NAMES } from "../../../utils/environment";
import { AWSClients } from "../../../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

//Get user Credits from database.
export const getUserWalletBalanceChild = async (userid) => {
  const params = {
    TableName: TABLE_NAMES.userCreditsTable,
    Key: {
      userid: userid,
    },
    ProjectionExpression: "credits", // Specify the columns to retrieve
  };

  console.log("dynamoDB getUserWalletBalanceChild Params -> ", params);

  try {
    const data = await dynamoDBExam.get(params).promise();

    if (!data.Item) {
      console.log(
        "User not found in database. Returning null from getUserWalletBalanceChild "
      );

      return null; // If user not found, return null
    }
    console.log("data.Item.credits -->> ", data.Item.credits);

    return data.Item.credits; // Return the user credits
  } catch (err) {
    console.log("Error retrieving user credits:", err);
    throw err;
  }
};