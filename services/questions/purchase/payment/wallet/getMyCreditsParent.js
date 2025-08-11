import { getUserWalletBalanceChild } from "./getUserWalletBalanceChild";

//Fetch User Profile for logged in user
export const getMyCreditsParent = async (request, response) => {
    console.log("Inside getMyCreditsParent request 1.0 ");
    console.log("Inside getMyCreditsParent request ", request);
    try {
      const userid = request.event.requestContext.authorizer.jwt.claims.username;
      console.log("request userid is -->> ", userid);
      const userWalletBalance = await getUserWalletBalanceChild(userid);
      console.log("userWalletBalance -->> ", userWalletBalance);
      if (userWalletBalance === null) {
        console.log("User Wallet Balance is null, returing 0 ");
        return { statusCode: 200, body: JSON.stringify(0) };
      } else if (userWalletBalance !== null && userWalletBalance !== undefined) {
        console.log(
          "userWalletBalance !== null && userWalletBalance !== undefined ",
          userWalletBalance
        );
        // If user profile exists, skip record creation
        return { statusCode: 200, body: JSON.stringify(userWalletBalance) };
      } else {
        // If user profile doesn't exist, create a new profile
        console.log("Could not fetch Wallet Balance.");
        return { statusCode: 204, body: "Could not fetch Wallet Balance." };
      }
    } catch (err) {
      console.log("Error inserting JSON data into Database:", err);
      return { statusCode: 500, body: "Error inserting JSON data into Database" };
    }
  };