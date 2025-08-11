import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Add my purchased course - single record
export const addMyCourse = async (record, userid) => {
  try {
    const today = new Date();
    const purchaseDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    //    const currentdate = new Date().toISOString();
    const params = {
      TableName: TABLE_NAMES.myCoursesTable,
      Item: {
        userid: userid,
        paperid: record.itemId,
        purchasedt: purchaseDate,
        purchaseprice: record.price,
        itemCategory: record.itemCat,
        //        "crtdt": currentdate,
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB addMyCoursesForUser Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "Data inserted successfully." };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};