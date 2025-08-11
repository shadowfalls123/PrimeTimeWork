import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApplicationAPI } from "./api";
import { AppDatabase } from "./database";
// import { ApplicationEvents } from './events';
import { ApplicationAuth } from "./auth";
import { AppServices } from "./services";
import { AssetStorage } from "./storage";
import { WebApp, WebAppProps } from "./webapp"; // Import the WebAppProps interface
// import { DocumentProcessing } from './processing';
/*
import { MyCertificateStack } from "../certificate-stack/certificate";
*/
import * as path from 'path';
import * as s3 from "aws-cdk-lib/aws-s3";
//import { ApplicationVpc } from './vpc';

export class CMEApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create the VPC
//    const vpc = new ApplicationVpc(this, 'ApplicationVpc');

    const storage = new AssetStorage(this, "Storage");

    const auth = new ApplicationAuth(this, "Auth");

    const database = new AppDatabase(this, "Database");

    const services = new AppServices(this, "Services", {
      questionsTable: database.questionsTable,
      myCoursesTable: database.myCoursesTable,
      packageTable: database.packageTable,
      submittedPapersTable: database.submittedPapersTable, 
      examResultsTable: database.examResultsTable,
      examResultsHistoryTable: database.examResultsHistoryTable,
      topRatedPapers: database.topRatedPapers,
      userProfileTable: database.userProfileTable,
      userCreditsTable: database.userCreditsTable,
      paymentHistoryTable: database.paymentHistoryTable,
      // documentsTable: database.documentsTable,
      uploadBucket: storage.uploadBucket,
      assetBucket: storage.assetBucket,
      userPool: auth.userPool,
    });

    const api = new ApplicationAPI(this, "API", {
      questionsService: services.questionsService,
      // commentsService: services.commentsService,
      // documentsService: services.documentsService,
      usersService: services.usersService,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
    });

    //     const processing = new DocumentProcessing(this, 'Processing', {
    //       uploadBucket: storage.uploadBucket,
    //       assetBucket: storage.assetBucket,
    //       documentsTable: database.documentsTable,
    //     });

    //     new ApplicationEvents(this, 'Events', {
    //       uploadBucket: storage.uploadBucket,
    //       processingStateMachine: processing.processingStateMachine,
    //       notificationsService: services.notificationsService,
    //     });

    // // Create an instance of MyCertificateStack to get the certificate
    // const myCertificateStack = new MyCertificateStack(this, 'MyCertificateStack');

    // // Create an instance of MyCertificateStack and pass the pre-validated certificate ARN
    // const myCertificateStack = new MyCertificateStack(this, 'MyCertificateStack', {
    //   certificateArn: props.certificateArn,
    // });

    // // Pass the certificate to the WebApp construct
    // const webapp = new WebApp(this, "WebApp", {
    //   hostingBucket: storage.hostingBucket,
    //   baseDirectory: "../../../",
    //   relativeWebAppPath: "webapp",
    //   httpApi: api.httpApi,
    //   userPool: auth.userPool,
    //   userPoolClient: auth.userPoolClient,
    //   // certificate: myCertificateStack.certificate,
    //   certificateArn: certificateArn, // Pass the certificate ARN as a parameter
    // });

    /*
// Create the MyCertificateStack and get the certificate ARN
//const myCertificateStack = new MyCertificateStack(this, 'MyCertificateStack');
const certificateArn = cdk.Fn.importValue('CertificateARN');
    */
// Import the certificate ARN
//const certificateArn = cdk.Fn.importValue('MyCertificateStack:CertificateARN');



    // Pass the certificate ARN as a parameter to the WebApp construct

    // // Import the hosting bucket ARN
    // const hostingBucketArn = cdk.Fn.importValue('CMEHostingBucketARN');

    const baseDirectory = path.resolve(__dirname, "../../../../");
    console.log("Base Directory:", baseDirectory);

    const relativeWebAppPath = "webapp";
    console.log("Relative Web App Path:", relativeWebAppPath);

    const webapp = new WebApp(this, "WebApp", {
      hostingBucket: storage.hostingBucket,
  //    baseDirectory: "../../../../",
      baseDirectory: baseDirectory,
//      relativeWebAppPath: "webapp",
      relativeWebAppPath: relativeWebAppPath,
      httpApi: api.httpApi,
      userPool: auth.userPool,
      userPoolClient: auth.userPoolClient,
//      certificateArn: certificateArn, // Pass the certificate ARN as a parameter
    });

    // const webapp = new WebApp(this, "WebApp", webappProps);
    // webapp.node.addDependency(auth);


    webapp.node.addDependency(auth);
  }
}
