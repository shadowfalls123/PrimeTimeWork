import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";
import { unzipData } from "../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

//Get paper details for the specific paperIds
export const getPaperDetailsFromS3 = async (paperIds) => {
  // Fetch submitted papers from S3
  console.log("In getPaperDetailsFromS3 1.0 paperIds -->> ", paperIds);
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    let unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data

    // Ensure unzippedData is an array
    let papersArray;
    if (Array.isArray(unzippedData)) {
      papersArray = unzippedData;
    } else {
      // Parse the string data into an array
      try {
        papersArray = JSON.parse(unzippedData);
      } catch (error) {
        console.error("Error parsing unzippedData:", error);
        throw error;
      }
    }

    console.log("Papers Array -->> ", papersArray);

    // Filter out papers based on provided paperIds
    const filteredPapers = papersArray.filter((paper) =>
      paperIds.includes(paper.pid.toString())
    );
    console.log("Filtered Papers", filteredPapers);

    return filteredPapers;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};