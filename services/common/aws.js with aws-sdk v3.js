
import { DynamoDBClient, ExecuteStatementCommand } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { TextractClient } from "@aws-sdk/client-textract";
import { SESClient } from "@aws-sdk/client-ses";
import { EventBridgeClient } from "@aws-sdk/client-eventbridge";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

let _dynamoDB;

/**
 * Creates the DynamoDB DocumentClient instance.
 * AWS SDK v3 doesn't include `DocumentClient` by default, you can use `marshmallowing` or libraries like `@aws-sdk/lib-dynamodb`.
 *
 * @returns {object} DynamoDBClient
 */
const dynamoDB = () => {
  if (!_dynamoDB) {
    _dynamoDB = new DynamoDBClient({ region: "your-region" });
  }
  return _dynamoDB;
};

let _dynamoDBHL;

/**
 * Creates the higher-level DynamoDB client for PartiQL.
 *
 * @returns {object} DynamoDBClient
 */
const dynamoDBHL = () => {
  if (!_dynamoDBHL) {
    _dynamoDBHL = new DynamoDBClient({ region: "your-region" });
  }
  return _dynamoDBHL;
};

let _dynamoDBPQL;

/**
 * Creates the PartiQL DynamoDB instance.
 *
 * @returns {object} DynamoDBClient with PartiQL logic
 */
const dynamoDBPQL = () => {
  if (!_dynamoDBPQL) {
    _dynamoDBPQL = new DynamoDBClient({ region: "your-region" });
    _dynamoDBPQL.queryPartiQL = async (params) => {
      const req = {
        Statement: params.Statement,
        Parameters: params.Parameters,
      };
      const command = new ExecuteStatementCommand(req);
      return await _dynamoDBPQL.send(command);
    };
  }
  return _dynamoDBPQL;
};

let _s3;

/**
 * Creates the S3 client.
 *
 * @returns {object} S3Client
 */
const s3 = () => {
  if (!_s3) {
    _s3 = new S3Client({ region: "your-region" });
  }
  return _s3;
};

let _textract;

/**
 * Creates the Textract client.
 *
 * @returns {object} TextractClient
 */
const textract = () => {
  if (!_textract) {
    _textract = new TextractClient({ region: "your-region" });
  }
  return _textract;
};

let _ses;

/**
 * Creates the SES client.
 *
 * @returns {object} SESClient
 */
const ses = () => {
  if (!_ses) {
    _ses = new SESClient({ region: "your-region" });
  }
  return _ses;
};

let _eventbridge;

/**
 * Creates the EventBridge client.
 *
 * @returns {object} EventBridgeClient
 */
const eventbridge = () => {
  if (!_eventbridge) {
    _eventbridge = new EventBridgeClient({ region: "your-region" });
  }
  return _eventbridge;
};

let _cisp;

/**
 * Creates the Cognito Identity Provider client.
 *
 * @returns {object} CognitoIdentityProviderClient
 */
const cisp = () => {
  if (!_cisp) {
    _cisp = new CognitoIdentityProviderClient({ region: "your-region" });
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
