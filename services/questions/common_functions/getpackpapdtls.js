
import { assetBucket } from "../utils/environment";
import { AWSClients } from "../../common";
import { unzipData } from "../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

//Get top 10 papers based on top ratings
export const getpackpapdtls = async (request, response) => {
  console.log("In getpackpapdtls 1.0");
  console.log("In getpackpapdtls request ", request);
  jsonRequestBody = JSON.parse(request.event.body);
  paperids = jsonRequestBody.paperids;
  console.log("paperids -->> ", paperids);
  // Fetch submitted papers from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `submittedpapers/sp.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    const allPapers = JSON.parse(unzippedData);
    console.log("allPapers -->> ", allPapers);
    const filteredPapers = allPapers.filter(paper => paperids.includes(paper.pid));
    console.log("filteredPapers -->> ", filteredPapers);
    return {
      statusCode: 200,
      body: JSON.stringify(filteredPapers),
    };

  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};