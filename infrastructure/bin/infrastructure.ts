#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CMEApplicationStack } from '../lib/core/cme-stack';

import { MyCertificateStack } from '../lib/core/certificate-stack/certificate';

// import { S3DeploymentStack } from '../lib/core/s3-deployment-stack';

// Determine the environment type (adjust this logic as per your environment setup)
const environmentType = process.env.NODE_ENV?.trim();  // Fetch your environment type here

// Define stack name prefix based on the environmentType
let stackNamePrefix = '';
if (environmentType === 'production') {
  stackNamePrefix = 'prod-';
} else if (environmentType === 'development') {
  stackNamePrefix = 'dev-';
} else if (environmentType === 'uat') {
  stackNamePrefix = 'uat-';
} else {
  stackNamePrefix = 'unknown-';
}

const app = new cdk.App();


// // Create the certificate stack
 const certificateStack = new MyCertificateStack(app, `${stackNamePrefix}MyCertificateStack`);

 



// // Obtain the certificate ARN from the certificate stack
// const certificateArn = cdk.Fn.importValue('CertificateARN');

// // Create the S3 deployment stack and pass the hosting bucket to it
// const s3DeploymentStack = new S3DeploymentStack(app, 'S3DeploymentStack', {
//     hostingBucket: yourHostingBucket, // Provide the actual hosting bucket here
//   });



new CMEApplicationStack(app, `${stackNamePrefix}CMEInfraStack`, {
    stackName: `${stackNamePrefix}CMEInfraStack`
});
