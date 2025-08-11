
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";

// Setup S3 Client
const s3 = AWSClients.s3();

export const getUserFeedback = async (request) => {
  console.log("In getUserFeedback request value is -->> ", request);
  paperid = request.pathVariables.pid;
  try {
    const params = {
      Bucket: assetBucket,
      Key: `userfeedback/${paperid}`,
    };

    const data = await s3.getObject(params).promise();
    console.log("data in getUserFeedback ->> ", data);
    const userFeedback = JSON.parse(data.Body.toString("utf-8"));
    console.log("userFeedback in getUserFeedback ->> ", userFeedback);
    //    return { statusCode: 200, body: userFeedback };
    // return userFeedback;
    // Remove userid field from each feedback object
    const feedbackWithoutUserId = userFeedback.map(
      ({ userid, ...rest }) => rest
    );
    console.log(
      "feedbackWithoutUserId in getUserFeedback ->> ",
      feedbackWithoutUserId
    );
    // Return the modified user feedback
    return feedbackWithoutUserId;
  } catch (err) {
    if (err.code === "NoSuchKey") {
      // console.error("User feedback not found in S3");
      // return { statusCode: 200, body: "User feedback not found" };
      console.log("File not found in S3:", err);
      return [];
    }
    console.error("Error retrieving user feedback:", err);
    return { statusCode: 500, body: "Error retrieving user feedback" };
  }
};