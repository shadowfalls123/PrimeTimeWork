
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Function to get user profile data from the database
export const getUserProfileData = async (userid) => {
  const params = {
    TableName: TABLE_NAMES.userProfileTable,
    Key: {
      userid: userid,
    },
    ProjectionExpression:
      "fname, lname, countrycd, usremail, countrynm, usrquali, userdesc, regastutor", // Specify the columns to retrieve
  };

  console.log("dynamoDB getUserProfile Params -> ", params);

  try {
    const data = await dynamoDBExam.get(params).promise();

    if (!data.Item) {
      return null; // If user profile not found, return null
    }

    // Transforming column names for security
    const userProfile = {
      firstname: data.Item.fname,
      lastname: data.Item.lname,
      countrycode: data.Item.countrycd,
      useremail: data.Item.usremail,
      usercountry: data.Item.countrynm,
      qualifications: data.Item.usrquali,
      briefDescription: data.Item.userdesc,
      isTutor: data.Item.regastutor,
    };

    return userProfile; // Return the transformed user profile data
  } catch (err) {
    console.log("Error retrieving user profile data:", err);
    throw err;
  }
};