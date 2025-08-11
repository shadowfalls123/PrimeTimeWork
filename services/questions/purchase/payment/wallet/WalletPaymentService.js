import { getUserWalletBalanceChild } from "./getUserWalletBalanceChild";

import { PaymentService } from "../PaymentService";
import { TABLE_NAMES } from "../../../utils/environment";
import { AWSClients } from "../../../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

class WalletPayment extends PaymentService {
    constructor(userId, amount) {
      super(userId, amount);
    }
  
    async processPayment() {
      console.log("[WalletPayment] processPayment amount ", this.amount);
      console.log("[WalletPayment] processPayment userId ", this.userId);
      const userWalletBalance = await getUserWalletBalanceChild(this.userId);
      console.log("[WalletPayment] userWalletBalance ", userWalletBalance);
      
      if (userWalletBalance === null || userWalletBalance === undefined) {
        return { statusCode: 204, body: "Could not fetch Wallet Balance." };
      }
  
      if (this.amount > userWalletBalance) {
        return { statusCode: 200, body: "Wallet balance is not sufficient." };
      }
  
      const newWalletBalance = userWalletBalance - this.amount;
      console.log("[WalletPayment] newWalletBalance ", newWalletBalance);
      await updateUserWalletBalance(this.userId, newWalletBalance);
  
      return { statusCode: 200, body: "Wallet payment successful." };
    }
  }


  //Update User Wallet Balance
  // Update user Credits in the database.
  const updateUserWalletBalance = async (userid, newBalance) => {
    const params = {
      TableName: TABLE_NAMES.userCreditsTable,
      Key: {
        userid: userid,
      },
      UpdateExpression: "SET credits = :newBalance",
      ExpressionAttributeValues: {
        ":newBalance": newBalance,
      },
      ReturnValues: "UPDATED_NEW", // Return the updated value of credits
    };
  
    console.log("dynamoDB updateUserWalletBalance Params -> ", params);
  
    try {
      const data = await dynamoDBExam.update(params).promise();
  
      if (!data.Attributes || !data.Attributes.credits) {
        console.log("Failed to update user wallet balance.");
        return null; // If update fails, return null
      }
  
      console.log("Updated user wallet balance:", data.Attributes.credits);
      return data.Attributes.credits; // Return the updated user credits
    } catch (err) {
      console.log("Error updating user wallet balance:", err);
      throw err;
    }
  };

  export { WalletPayment };