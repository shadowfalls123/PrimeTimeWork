
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";
import { unzipData } from "../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

// Get all questions for a Exam for a paperid from S3
export const getExamQuestionsChildForTutorFromS3 = async (paperid) => {
  // console.log("Request in getExamQuestions 1.0 -> ", request);
  console.log(
    "In getExamQuestionsChildForTutorFromS3 1.0 -> paperid -->> ",
    paperid
  );
  // const paperid = request.pathVariables.paperid;

  // const examInstructions = await getExamInstructions(paperid);

  // Creating a new file for exam with the file names as paperid
  const examQuestionsparams = {
    Bucket: assetBucket,
    Key: `examquestions/${paperid}`,
  };

  try {
    const data = await s3.getObject(examQuestionsparams).promise();
    console.log("Raw Data as retrieved from S3", data);
    examData = unzipData(data.Body.toString()); // Unzip the data
    console.log("Existing Data:", examData);

    return examData;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code === "NoSuchKey") {
      console.error("File not found in S3: ", error);
      return [];
      //        return { statusCode: 500, body: "Error getting papers file" };
    }
    console.error("Error getting existing file:", error);
    throw new Error("Error getting exam questions file");
  }

  //  return results.Items;
};