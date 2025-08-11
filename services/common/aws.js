import * as AWS from 'aws-sdk';

// // Enable logging for AWS SDK
// AWS.config.logger = console; // Set the logger to console to log AWS SDK calls


let _dynamoDB;

/**
 * Creates the DynamoDB client for use in the application.
 *
 * @returns {object} DynamoDB Client
 */
const dynamoDB = () => {
  if (!_dynamoDB) {
    _dynamoDB = new AWS.DynamoDB.DocumentClient();
  }
  return _dynamoDB;
};

//Higher Higher Level instance
let _dynamoDBHL;

/**
 * Creates the DynamoDB for use in the application.
 *
 * @returns {object} DynamoDB
 */
const dynamoDBHL = () => {
  if (!_dynamoDBHL) {
    _dynamoDBHL = new AWS.DynamoDB();
  }
  return _dynamoDBHL;
};

/**
 * Creates the DynamoDB client for use in the application.
 *
 * @returns {object} DynamoDB Client
 */
// const dynamoDB = () => {
//   if (!_dynamoDB) {
//     _dynamoDB = new AWS.DynamoDB.DocumentClient();
//     _dynamoDB.queryPartiQL = async (params) => {
//       const req = {
//         Statement: params.Statement,
//         Parameters: params.Parameters,
//       };
//       return _dynamoDB.executeStatement(req).promise();
//     };
//   }
//   return _dynamoDB;
// };

let _dynamoDBPQL;

//dynamoDB instace for PartiQL
const dynamoDBPQL = () => {
  if (!_dynamoDBPQL) {
    _dynamoDBPQL = new AWS.DynamoDB();
    _dynamoDBPQL.queryPartiQL = async (params) => {
      const req = {
        Statement: params.Statement,
        Parameters: params.Parameters,
      };
      return _dynamoDBPQL.executeStatement(req).promise();
    };
  }
  return _dynamoDBPQL;
};



let _s3;

/**
 * Creates the Amazon S3 client for use in the application.
 *
 * @returns {object} Amazon S3 Client
 */
const s3 = () => {
  if (!_s3) {
    _s3 = new AWS.S3();
  }
  return _s3;
};

let _textract;

/**
 * Creates the Textract client for use in the application.
 *
 * @returns {object} Textract Client
 */
const textract = () => {
  if (!_textract) {
    _textract = new AWS.Textract();
  }
  return _textract;
};

let _ses;

/**
 * Creates the Simple Email Service (SES) client for use in the application.
 *
 * @returns {object} Simple Email Service Client
 */
const ses = () => {
  if (!_ses) {
    _ses = new AWS.SES();
  }
  return _ses;
};

let _eventbridge;

/**
 * Creates the Eventbridge client for use in the application.
 *
 * @returns {object} Eventbridge Client
 */
const eventbridge = () => {
  if (!_eventbridge) {
    _eventbridge = new AWS.EventBridge();
  }
  return _eventbridge;
};

let _cisp;

/**
 * Creates the Cognito Identity Service Provider client for use in the application.
 *
 * @returns {object} Cognito Identity Service Provider Client
 */
const cisp = () => {
  if (!_cisp) {
    _cisp = new AWS.CognitoIdentityServiceProvider();
  }
  return _cisp;
};

export const AWSClients = {
  dynamoDB,
  dynamoDBHL,
  dynamoDBPQL,
  s3,
  textract,
  ses,
  eventbridge,
  cisp,
};
