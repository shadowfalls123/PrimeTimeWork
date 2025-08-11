import { assetBucket } from  "../../utils/environment";
import { AWSClients } from "../../../common";
import { zipData, unzipData } from "../../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

// Save ContactUsMessages
export const contactUsMsgs = async (request, response) => {
  console.log("Inside contactUsMsgs request ", request);
  const contactMsg = JSON.parse(request.event.body);
  console.log("Inside contactUsMsgs contactMsg ", contactMsg);

  if (!contactMsg) {
    console.log("Incomplete message");
    return {
      statusCode: 400,
      body: "Incomplete message",
    };
  }
  const contactname = contactMsg.contactusrecord.name;
  const contactemail = contactMsg.contactusrecord.email;
  const contactmessage = contactMsg.contactusrecord.message;
  
  const currentDate = new Date();
  // Format the date directly without converting to ISO
  const currentMMYYYY = currentDate.toLocaleDateString("en-US", {
    month: "2-digit",
    year: "numeric",
  });

  console.log(currentMMYYYY);

  const getcontactMgsparams = {
    Bucket: assetBucket,
    Key: `contactmessages/${currentMMYYYY}`, // Use the key format used during upload
  };

  // Retrieve existing papers data from S3
  let existingMsgData = "";
  let msgDatafileExists = false;
  try {
    const data = await s3.getObject(getcontactMgsparams).promise();
    console.log("Raw Data as retrieved from S3", data);
    existingMsgData = unzipData(data.Body.toString()); // Unzip the data
    console.log("Existing Messages:", existingMsgData);
    msgDatafileExists = true;
  } catch (error) {
    // If the file doesn't exist, proceed with an empty string
    if (error.code !== "NoSuchKey") {
      console.error("Error getting existing file:", error);
      return { statusCode: 500, body: "Error getting papers file" };
    }
  }

  // Append the new paper
  let updatedContactArray = existingMsgData ? JSON.parse(existingMsgData) : [];
  console.log("Existing Data:", existingMsgData);
  updatedContactArray.push(contactMsg);
  console.log("Updated Data:", updatedContactArray);
  console.log(
    "JSON.stringify(updatedContactArray) -->> ",
    JSON.stringify(updatedContactArray)
  );

  // Creating a new file for exam with the file names as paperid
  const contactMsgparams = {
    Bucket: assetBucket,
    Key: `contactmessages/${currentMMYYYY}`, // Use the key format used during upload
    Body: zipData(JSON.stringify(updatedContactArray)), // Zip the data
    ContentEncoding: "gzip", // Indicate the content encoding for S3
    ContentType: "application/gzip",
  };
  try {
    await s3.upload(contactMsgparams).promise();
    return { statusCode: 200, body: "Contact message saved successfully" };
  } catch (err) {
    console.error("Error updating message:", err);
    return { statusCode: 500, body: "Error updating message" };
  }
};