import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsServiceFunction } from "../../constructs/lambda";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as dotenv from 'dotenv';

interface AppServicesProps {
  questionsTable: dynamodb.ITable;
  myCoursesTable: dynamodb.ITable;
  packageTable: dynamodb.ITable;
  submittedPapersTable: dynamodb.ITable;
  examResultsTable: dynamodb.ITable;
  topRatedPapers: dynamodb.ITable;
  examResultsHistoryTable: dynamodb.ITable;
  userProfileTable: dynamodb.ITable;
  userCreditsTable: dynamodb.ITable;
  paymentHistoryTable: dynamodb.ITable;
  uploadBucket: s3.IBucket;
  assetBucket: s3.IBucket;
  userPool: cognito.IUserPool;
}

// Load the appropriate .env file based on the deployment environment
const environmentType = process.env.NODE_ENV?.trim(); 
//const envFile = environmentType === 'production' ? '.env.prod' : '.env.dev';

let envFile;
if (environmentType === 'production') {
  envFile = '.env.prod';
} else if (environmentType === 'development') {
  envFile = '.env.dev';
} else if (environmentType === 'uat') {
  envFile = '.env.uat';
} else {
  console.log('Unknown environment specified');
  process.exit(1); // Optionally exit the process if the environment is unknown
}

dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', envFile) });
console.log('path.resolve(__dirname, .., envFile) ->> ', path.resolve(__dirname, '..', '..', '..', envFile));
console.log('environmentType value is -->> ', environmentType);

// Check the value of NODE_ENV
if (environmentType === 'production') {
  console.log('Running in production environment');
} else if (environmentType === 'development') {
  console.log('Running in development environment');
} else if (environmentType === 'uat') {
  console.log('Running in uat environment');
} else {
  console.log('Running in an unknown environment');
}

// Retrieve the WEBSITE_URL from the environment variables
const razorPayKeyId = process.env.RAZORPAY_KEY_ID;
const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const openAPIKeyId = process.env.OPEN_API_KEY_ID;
const openAPIKeySecret = process.env.OPEN_API_KEY_SECRET;
const phonepeKeySecret = process.env.PHONEPE_KEY_SECRET
const phonepeUrl = process.env.PHONEPE_URL
const phonepeMerchantId = process.env.PHONEPE_MERCHANT_ID
const phonepeMerchantUserId = process.env.PHONEPE_MERCHANT_USER_ID
const phonepeKeyIndex = process.env.PHONEPE_KEYINDEX

export class AppServices extends Construct {
  // public readonly commentsService: NodejsFunction;

  // public readonly documentsService: NodejsFunction;

  // public readonly notificationsService: NodejsFunction;

  public readonly usersService: NodejsFunction;

  public readonly questionsService: NodejsFunction;
//  public readonly role: iam.IRole; // Expose the role as a property

  constructor(scope: Construct, id: string, props: AppServicesProps) {
    super(scope, id);

    //this.role = this.role; // Assign the role to the exposed property
    
    // Questions Service -------------------------------------------------

    this.questionsService = new NodejsServiceFunction(
      this,
      "QuestionServiceLambda",
      {
        entry: path.join(__dirname, "../../../../services/questions/index.js"),
      }
    );

    props.questionsTable.grantReadWriteData(this.questionsService);
    props.myCoursesTable.grantReadWriteData(this.questionsService);
    props.packageTable.grantReadWriteData(this.questionsService);
    props.submittedPapersTable.grantReadWriteData(this.questionsService);
    props.examResultsTable.grantReadWriteData(this.questionsService);
    props.topRatedPapers.grantReadWriteData(this.questionsService);
    props.examResultsHistoryTable.grantReadWriteData(this.questionsService);
    props.userProfileTable.grantReadWriteData(this.questionsService);
    props.userCreditsTable.grantReadWriteData(this.questionsService);
    props.paymentHistoryTable.grantReadWriteData(this.questionsService);
    props.uploadBucket.grantReadWrite(this.questionsService);
    props.assetBucket.grantReadWrite(this.questionsService);
    // // Explicitly grant cognito-idp:AdminAddUserToGroup action on the Cognito User Pool
    // props.userPool.grant(this.questionsService.role, 'cognito-idp:AdminAddUserToGroup');

    // Grant necessary permissions to the Lambda functions
props.userPool.grant(this.questionsService.grantPrincipal, 'cognito-idp:AdminAddUserToGroup');

    this.questionsService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["events:PutEvents", "dynamodb:PartiQLSelect"],
      })
    );
    
    this.questionsService.addEnvironment(
      "DYNAMO_DB_PAPERQUESTIONS_TABLE",
      props.questionsTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_MYCOURSES_TABLE",
      props.myCoursesTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_PACKAGE_TABLE",
     props.packageTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_SUBMITTEDPAPERS_TABLE",
     props.submittedPapersTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_EXAMRESULTS_TABLE",
      props.examResultsTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_EXAMRESULTSHISTORY_TABLE",
      props.examResultsHistoryTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_TOPRATEDPAPERS_TABLE",
      props.topRatedPapers.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_USERPROFILE_TABLE",
      props.userProfileTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_USERCREDITS_TABLE",
      props.userCreditsTable.tableName
    );
    this.questionsService.addEnvironment(
      "DYNAMO_DB_PAYMENTHISTORY_TABLE",
      props.paymentHistoryTable.tableName
    );
    this.questionsService.addEnvironment(
      "UPLOAD_BUCKET",
      props.uploadBucket.bucketName
    );
    this.questionsService.addEnvironment(
      "ASSET_BUCKET",
      props.assetBucket.bucketName
    );
    // Pass the UserPool ID to the lambda function
    this.questionsService.addEnvironment(
      "USER_POOL_ID",
      props.userPool.userPoolId
    );

    // Pass the RazorPay Key ID and Secret to the Lambda function
    this.questionsService.addEnvironment(
      "RAZORPAY_KEY_ID",
      razorPayKeyId || ""
    );
    this.questionsService.addEnvironment(
      "RAZORPAY_KEY_SECRET",
      razorPayKeySecret || ""
    );

    this.questionsService.addEnvironment(
      "PHONEPE_KEY_SECRET",
      phonepeKeySecret || ""
    );

    this.questionsService.addEnvironment(
      "PHONEPE_URL",
      phonepeUrl || ""
    );
    this.questionsService.addEnvironment(
      "PHONEPE_MERCHANT_ID",
      phonepeMerchantId || ""
    );
    this.questionsService.addEnvironment(
      "PHONEPE_MERCHANT_USER_ID",
      phonepeMerchantUserId || ""
    );
    this.questionsService.addEnvironment(
      "PHONEPE_KEYINDEX",
      phonepeKeyIndex || ""
    );
        
    // Pass the OpenAPI Key ID and Secret to the Lambda function
    this.questionsService.addEnvironment(
      "OPEN_API_KEY_ID",
      openAPIKeyId || ""
    );
    this.questionsService.addEnvironment(
      "OPEN_API_KEY_SECRET",
      openAPIKeySecret || ""
    );
    
    // // Comments Service -------------------------------------------------

    // this.commentsService = new NodejsServiceFunction(this, 'CommentServiceLambda', {
    //   entry: path.join(__dirname, '../../../services/comments/index.js'),
    // });

    // props.documentsTable.grantReadWriteData(this.commentsService);

    // this.commentsService.addToRolePolicy(
    //   new iam.PolicyStatement({
    //     resources: ['*'],
    //     actions: ['events:PutEvents'],
    //   }),
    // );

    // this.commentsService.addEnvironment('DYNAMO_DB_PAPERQUESTIONS_TABLE', props.documentsTable.tableName);

    // // Documents Service ------------------------------------------------

    // this.documentsService = new NodejsServiceFunction(this, 'DocumentServiceLambda', {
    //   entry: path.join(__dirname, '../../../services/documents/index.js'),
    //   timeout: cdk.Duration.seconds(10),
    // });

    // props.documentsTable.grantReadWriteData(this.documentsService);
    // props.uploadBucket.grantWrite(this.documentsService);
    // props.assetBucket.grantRead(this.documentsService);
    // this.documentsService.addEnvironment('DYNAMO_DB_PAPERQUESTIONS_TABLE', props.documentsTable.tableName);
    // this.documentsService.addEnvironment('UPLOAD_BUCKET', props.uploadBucket.bucketName);
    // this.documentsService.addEnvironment('ASSET_BUCKET', props.assetBucket.bucketName);

    //   // Notifications Service ---------------------------------------------

    //   this.notificationsService = new NodejsServiceFunction(this, 'NotificationsServiceLambda', {
    //     entry: path.join(__dirname, '../../../services/notifications/index.js'),
    //   });

    //   this.notificationsService.addToRolePolicy(
    //     new iam.PolicyStatement({
    //       resources: ['*'],
    //       actions: ['ses:SendEmail', 'ses:SendRawEmail'],
    //     }),
    //   );

    //   props.documentsTable.grantReadData(this.notificationsService);

    //   this.notificationsService.addEnvironment('DYNAMO_DB_PAPERQUESTIONS_TABLE', props.documentsTable.tableName);
    //   this.notificationsService.addEnvironment(
    //     'EMAIL_ADDRESS',
    //     ssm.StringParameter.valueForStringParameter(this, 'dms-kodinghut-email'),
    //   );

    // Users Service ------------------------------------------------------

    this.usersService = new NodejsServiceFunction(this, "UsersServiceLambda", {
      entry: path.join(__dirname, "../../../../services/users/index.js"),
    });

    this.usersService.addEnvironment("USER_POOL_ID", props.userPool.userPoolId);
         this.usersService.addEnvironment('ASSET_BUCKET', props.assetBucket.bucketName);
         props.assetBucket.grantReadWrite(this.usersService);

    this.usersService.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [props.userPool.userPoolArn],
        actions: ["cognito-idp:*"],
      })
    );
  }
}
