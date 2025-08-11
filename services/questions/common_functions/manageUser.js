import { assetBucket, TABLE_NAMES } from "../utils/environment";
import { AWSClients } from "../../common";
import { getUserProfileData } from "./getUserProfileData";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

// Setup S3 Client
const s3 = AWSClients.s3();

// Fetch User Profile for logged in user
export const fetchUserProfile = async (request, response) => {
  console.log("Inside fetchUserProfile request 1.0 ");
  console.log("Inside fetchUserProfile request ", request);
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);

    // Get user profile data from the database
    const existingUserProfileData = await getUserProfileData(userid);

    if (existingUserProfileData) {
      // If user profile exists, fetch profile image from S3
      const profileImage = await getUserProfileImage(userid);

      // Add profile image to the user profile data
      existingUserProfileData.profileImage = profileImage;
      console.log("existingUserProfileData -->> ", existingUserProfileData);
      return { statusCode: 200, body: JSON.stringify(existingUserProfileData) };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist.");
      return { statusCode: 204, body: "User profile does not exist" };
    }
  } catch (err) {
    console.log("Error fetching user profile:", err);
    return { statusCode: 500, body: "Error fetching user profile" };
  }
};

//Create User Profile
const createUserProfileChild = async (userid, record) => {
  console.log("Inside createUserProfileChild request 1.0 ");
  console.log("Inside createUserProfileChild record ", record);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    console.log("request userid is -->> ", userid);
    console.log("request email is -->> ", record.useremail);
    console.log("request name is -->> ", record.firstname);
    console.log("request name is -->> ", record.lastname);
    //    const today = new Date();
    const currentdate = new Date().toISOString();
    const params = {
      TableName: TABLE_NAMES.userProfileTable,
      Item: {
        userid: userid,
        fname: "",
        lname: "",
        usremail: record.useremail,
        address: "",
        city: "",
        zipcode: "",
        countrycd: "",
        countrynm: "",
        crtdt: currentdate,
        updatedt: "",
        customcol1: "",
        customcol2: "",
        customcol3: "",
        customcol4: "",
        customcol5: "",
      },
    };

    console.log("dynamoDB createUserProfileChild Params -> ", params);

    const results = await dynamoDBExam.put(params).promise();
    return { statusCode: 200, body: "User profile updated successfully." };
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Create User Profile
export const createUserProfile = async (request, response) => {
  console.log("Inside createUserProfile request 1.0 ");
  console.log("Inside createUserProfile request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;
    console.log("request userid is -->> ", userid);
    const existingUserProfile = await getUserProfileData(userid);

    if (existingUserProfile) {
      // If user profile exists, skip record creation
      return { statusCode: 200, body: "User profile already exists" };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist. Creating new profile.");

      // Use createUserProfile function to create a new profile
      const createResult = await createUserProfileChild(userid, record);
      //        return createResult;

      /* 
            // This code is working. Uncomment this to get the user added to a specific userPoolID in a particular group
             // Add user to Cognito user group after profile creation
             try {
              const params = {
                GroupName: 'student', // Making the user a member of this default group
                UserPoolId: userPoolID, //use the userpool ID from the lambda emvironment
                Username: userid,
              };
              await cognitoISP.adminAddUserToGroup(params).promise();
              console.log(`User ${userid} added to group: ${params.GroupName}`);
            } catch (error) {
              console.error('Error adding user to group:', error);
              // Handle error appropriately
            }
      */
      return { statusCode: 200, body: "User Profile created successfully." };
    }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

//Update User Profile image
export const updateUserProfileImage = async (request, response) => {
  console.log("Inside updateUserProfileImage request 1.0 ");
  console.log("Inside updateUserProfileImage request ", request);

  try {
    const formData = JSON.parse(request.event.body);
    // const formData = request.event.body;
    if (!formData) {
      return { statusCode: 400, body: "No data provided" };
    }
     const userid = request.event.requestContext.authorizer.jwt.claims.username;

    let s3ImagePath = ""; // Declare s3ImagePath variable outside the conditional block

    // Check if the formData has data
    if (formData) {

      const imageData = formData.profileImage;
      const [prefix, base64Image] = imageData.split(',');
      const buffer = Buffer.from(base64Image, "base64");
      const contentType = prefix.split(':')[1].split(';')[0];
      console.log("imageData -->> ", imageData);
      console.log("contentType -->> ", contentType);
      // Assuming record contains raw image data
      //      const buffer = Buffer.from(formData);
      // const buffer = Buffer.from(formData.profileImage, "base64"); // Assuming record contains base64 encoded data

      // Upload the image to S3
      const params = {
        Bucket: assetBucket, // Replace with your actual bucket name
        Key: `profile/${userid}`, // Store in the 'profile' folder with the userid as the filename
        Body: buffer,
        ACL: "private", // Set appropriate permissions to restrict access to the uploaded image
        ContentType: contentType, // Change content type according to your image type
      };

      // Upload image to S3
      const uploadResult = await s3.upload(params).promise();
      console.log("Uploaded image to S3:", uploadResult.Location);

      // Get the S3 path of the uploaded image
      s3ImagePath = uploadResult.Location;

      console.log("S3 image path:", s3ImagePath);
      return { statusCode: 200, body: "Profile image uploaded successfully" };
    } else {
      // Return error if no record or profile image is found
      console.log("No user profile image provided.");
      return { statusCode: 400, body: "No user profile image provided" };
    }
  } catch (err) {
    // Catch any exceptions during the process
    console.log("Error updating profile image:", err);
    return { statusCode: 500, body: "Error updating profile image" };
  }
};

export const deleteUserProfileImage = async (request, response) => {
  console.log("In deleteUserProfileImage -->> ");
  const userid = request.event.requestContext.authorizer.jwt.claims.username;
  const s3Params = {
    Bucket: process.env.ASSET_BUCKET, // Use the environment variable for the bucket name
    Key: `profile/${userid}`, // Use the key format used during upload
  };

  try {
    console.log("deleteUserProfileImage s3Params -->> ", s3Params);
    await s3.deleteObject(s3Params).promise();
    console.log("Deleted profile image from S3 for user:", userid);
    return { statusCode: 200, body: "Profile image deleted successfully" };
  } catch (s3Error) {
    console.log("Error deleting profile image from S3:", s3Error);
    if (s3Error.code === 'NoSuchKey') {
      console.log(`No profile image found for user ${userid}`);
      return { statusCode: 404, body: "Profile image not found" };
    } else if (s3Error.code === 'ValidationException') {
      console.log("ValidationException: Check bucket name and key format");
      return { statusCode: 400, body: "Invalid bucket name or key format" };
    } else {
      return { statusCode: 500, body: "Error deleting profile image" };
    }
  }
};


//Update User Profile
export const updateUserProfile = async (request, response) => {
  console.log("Inside updateUserProfile request 1.0 ");
  console.log("Inside updateUserProfile request ", request);
  const record = JSON.parse(request.event.body);
  if (!record) {
    return { statusCode: 400, body: "No data provided" };
  }
  try {
    const userid = request.event.requestContext.authorizer.jwt.claims.username;

    const existingUserProfile = await getUserProfileData(userid);
   
    const s3ImagePath = assetBucket + `/profile/${userid}`;
    //Update the userProfile data
    if (existingUserProfile) {
      // If user profile exists, update the record
      const currentdate = new Date().toISOString();

      // Mapping updated attributes back to original column names
      const updatedProfile = {
        fname: record.firstname || existingUserProfile.firstname || "", // Use '' if no value provided
        lname: record.lastname || existingUserProfile.lastname || "", // Use '' if no value provided
        countrycd: record.countrycode || existingUserProfile.countrycode || "", // Use '' if no value provided
        countrynm: record.countryname || existingUserProfile.countryname || "", // Use '' if no value provided
        updatedt: currentdate,
        profileimage: s3ImagePath || "", // Use '' if no value provided, // Add the S3 image path to the profile
        usrquali: record.qualifications || "",
        userdesc: record.briefDescription || "",
        regastutor: record.isTutor || "",
      };
      // Update the profile in the database with S3 image path
      const paramsForUpdate = {
        TableName: TABLE_NAMES.userProfileTable,
        Key: {
          userid: userid,
        },
        UpdateExpression:
          "SET fname = :fnameVal, lname = :lnameVal, countrycd = :countrycdVal, countrynm = :countrynmVal, updatedt = :updatedtVal, profileimage = :profileImageVal, usrquali = :usrqualiVal, userdesc = :userdescVal, regastutor = :regastutorVal",
        ExpressionAttributeValues: {
          ":fnameVal": updatedProfile.fname,
          ":lnameVal": updatedProfile.lname,
          ":countrycdVal": updatedProfile.countrycd,
          ":countrynmVal": updatedProfile.countrynm,
          ":updatedtVal": updatedProfile.updatedt,
          ":profileImageVal": updatedProfile.profileimage,
          ":usrqualiVal": updatedProfile.usrquali,
          ":userdescVal": updatedProfile.userdesc,
          ":regastutorVal": updatedProfile.regastutor,
        },
      };

      // Update user profile table with the S3 image path
      console.log("dynamoDB updateUserProfile Params -> ", paramsForUpdate);
      await dynamoDBExam.update(paramsForUpdate).promise();

      return { statusCode: 200, body: "Data updated successfully." };
    } else {
      // If user profile doesn't exist, create a new profile
      console.log("User profile does not exist. Creating new profile.");

      // // Use createUserProfile function to create a new profile
      // const createResult = await createUserProfile(userid, record);
      // return createResult;
      return {
        statusCode: 400,
        body: "User profile does not exist, update profile failed",
      };
    }
  } catch (err) {
    console.log("Error inserting JSON data into Database:", err);
    return { statusCode: 500, body: "Error inserting JSON data into Database" };
  }
};

// Function to get user profile image from S3
const getUserProfileImage = async (userid) => {
  const s3Params = {
    Bucket: assetBucket, // Replace with your actual bucket name
    Key: `profile/${userid}`, // Use the key format used during upload
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();

    // Convert image data to base64
    const base64Image = s3Data.Body.toString("base64");
    const contentType = s3Data.ContentType || 'image/jpeg'; // Default to 'image/jpeg' if ContentType is missing
    const profileImage = `data:${contentType};base64,${base64Image}`;
    console.log("Retrieved image from S3:", profileImage);
    return profileImage;

  } catch (s3Error) {
    // Handle the case when the S3 object (profile image) doesn't exist
    if (s3Error.code === "NoSuchKey") {
      console.log("Profile image not found for user:", userid);
      // Optionally, you can set a default image or handle the absence of a profile image here
      // return ''; // Set a default image or handle the absence accordingly
      return null; // Or return null indicating absence of profile image
    } else {
      console.log("Error retrieving profile image from S3:", s3Error);
      throw s3Error;
    }
  }
};