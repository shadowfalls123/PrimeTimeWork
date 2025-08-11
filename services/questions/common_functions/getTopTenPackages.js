import { unzipData } from "../utils/zipUnzip";
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";

// Setup S3 Client
const s3 = AWSClients.s3();

//Get top 10 papers based on top ratings
export const getTopTenPackagesFromS3 = async (request, response) => {
  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `packages/package.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    return unzippedData;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};
