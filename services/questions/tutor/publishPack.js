import { AWSClients } from "../../common";
import { zipData, unzipData } from "../utils/zipUnzip";
import { assetBucket } from "../utils/environment";

// Setup S3 Client
const s3 = AWSClients.s3();

export const publishPack = async (request, response) => {
  console.log("Inside publishPackage request 1.0 ");
  console.log("Inside publishPackage request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No JSON data provided" };
  }

  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const timestamp = Date.now();
    const packRating = 0; // Initial rating for any exam is set as zero. Based on the reviews the ratings will increase

    const currentdate = new Date().toISOString();

    const s3PackageParams = {
      Bucket: assetBucket,
      Key: `packages/package.txt.gz`, // Use the key format used during upload
    };

    // Retrieve existing papers data from S3
    let existingData = "";
    let fileExists = false;

    try {
      const data = await s3.getObject(s3PackageParams).promise();
      console.log("Raw Data as retrieved from S3", data);
      existingData = unzipData(data.Body.toString()); // Unzip the data
      console.log("Existing Data:", existingData);
      fileExists = true;
    } catch (error) {
      // If the file doesn't exist, proceed with an empty string
      if (error.code !== "NoSuchKey") {
        console.error("Error getting existing file:", error);
        return { statusCode: 500, body: "Error getting papers file" };
      }
    }

    // Update updatedPackageData with userid and nextPackageId
    const updatedPackageData = {
      ...record,
      packrating: packRating,
      userid: userid,
      //      packid: nextPackageId,
      createdate: currentdate,
    };
    console.log("updatedPackageData -->> ", updatedPackageData);
    // Append new package data to existing data or create a new array if no data exists
    let updatedPackageArray = [];

    if (existingData) {
      updatedPackageArray = JSON.parse(existingData);
    }

    // Check if the package already exists
    const existingPackageIndex = updatedPackageArray.findIndex(
      (pkg) => pkg.packid === updatedPackageData.packid
    );

    if (existingPackageIndex > -1) {
      // Update existing package
      updatedPackageArray[existingPackageIndex] = updatedPackageData;
    } else {
      // Append new package data
      updatedPackageArray.push(updatedPackageData);
    }

    // Append the new package data
    //    updatedPackageArray.push(updatedPackageData);
    console.log("Updated Data:", updatedPackageArray);
    console.log(
      "JSON.stringify(updatedPackageArray) -->> ",
      JSON.stringify(updatedPackageArray)
    );

    // Save updated data to S3
    const savePackageparams = {
      Bucket: assetBucket,
      Key: `packages/package.txt.gz`, // Use the key format used during upload
      Body: zipData(JSON.stringify(updatedPackageArray)), // Zip the data
      ContentEncoding: "gzip", // Indicate the content encoding for S3
      ContentType: "application/gzip",
    };
    console.log("savePackageparams:", savePackageparams);

    // Update or create the file in S3
    try {
      await s3.upload(savePackageparams).promise();
    } catch (error) {
      console.error("Error creating the package file:", error);
      return { statusCode: 500, body: "Error creating the package file" };
    }
    return { statusCode: 200, body: "Package Published Successfully" };
  } catch (err) {
    console.log("Error inserting data into Database:", err);
    return { statusCode: 500, body: "Error inserting data into Database" };
  }
};
