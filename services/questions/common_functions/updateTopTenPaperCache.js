
import { TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

//updateTopTenPaperCache Table
export const updateTopTenPaperCache = async (request, response) => {
  try {
    const result = await getTopTenPapersFromSubmittedPaperTab();
    //    const result = await dynamoDBExam.query(params).promise();
    console.log("Top10Paper result -->>", result);
    const items = result;
    const putRequests = items.map((item) => {
      return {
        PutRequest: {
          Item: {
            paperid: item.paperid,
            paperrating: item.paperrating,
            examdesc: item.examdesc,
            paperprice: item.paperprice,
            examtitle: item.examtitle,
          },
        },
      };
    });
    const params = {
      RequestItems: {
        [TABLE_NAMES.topRatedPapers]: putRequests,
      },
    };
    console.log("Top10Paper params -->>", params);
    console.log(
      "Top10Paper JSON.stringify(params) -->>",
      JSON.stringify(params)
    );
    await dynamoDBExam.batchWrite(params).promise();
    console.log("Cache updated successfully");
  } catch (error) {
    console.error("Error updating cache:", error);
  }
};