
import { assetBucket } from "../../utils/environment";
import { AWSClients } from "../../../common";
import { unzipData } from "../../utils/zipUnzip";

// Setup S3 Client
const s3 = AWSClients.s3();

//Get exams based on the search criteria
export const searchPacks = async (request, response) => {
  console.log("In searchPacks request 1 -->> ", request);
  console.log("In searchPacks request 2 -->> ", request.event.body);
  const requestBody = JSON.parse(request.event.body);
  console.log("In searchPacks request 3 -->> ", requestBody.searchText);
  // const result = await searchExamQuery(requestBody);
  //  const result = await linearSearchFromFile(requestBody);
  //  const result = await searchInMultipleStringsFromFile(requestBody);
  const result = await searchInMultiplePackFields(requestBody);
  return result;
};

const searchInMultiplePackFields = async (requestBody) => {
  console.log("In searchInMultiplePackFields request 1 -->> ", requestBody);
  console.log("In searchInMultiplePackFields request 2 -->> ", requestBody.searchText);
  const searchText = requestBody.searchText;
  console.log("In searchInMultiplePackFields request 3 -->> ", searchText);
  const searchWords = searchText.toLowerCase().split(/\s+/);

  // Fetch submitted packages from S3
  const s3Params = {
    Bucket: assetBucket,
    Key: `packages/package.txt.gz`,
  };

  try {
    const s3Data = await s3.getObject(s3Params).promise();
    console.log("Raw Data as retrieved from S3", s3Data);
    const unzippedData = unzipData(s3Data.Body.toString()); // Unzip the data
    console.log("Unzipped Data", unzippedData);
    const searchData = JSON.parse(unzippedData);

    // Perform a search using filter on multiple fields and any of the words
    const searchResults = searchData.map((pack) => {
      const lowerCasePackDesc = pack.packDesc.toLowerCase();
      const lowerCasePackTitle = pack.packTitle.toLowerCase();

      // Count the number of matching words
      const matchingWordsCount = searchWords.reduce(
        (count, word) =>
          count +
          (lowerCasePackDesc.includes(word) ||
            lowerCasePackTitle.includes(word)
            ? 1
            : 0),
        0
      );

      return {
        ...pack,
        matchingWordsCount,
      };
    });

    // Sort the search results based on the number of matching words and then by pack rating
    searchResults.sort((a, b) => {
      if (b.matchingWordsCount !== a.matchingWordsCount) {
        return b.matchingWordsCount - a.matchingWordsCount;
      }
      // If word count is the same, prioritize higher pack rating
      return b.packrating - a.packrating;
    });

    // Remove the temporary 'matchingWordsCount' property from the final results
    const finalResults = searchResults.map(
      ({ matchingWordsCount, ...rest }) => rest
    );

    return finalResults;
  } catch (s3Error) {
    if (s3Error.code === "NoSuchKey") {
      console.log("Data File not found for search:");
    } else {
      console.log("Error retrieving data file for search:", s3Error);
      throw s3Error;
    }
  }
};