// #!/usr/bin/env node
// import 'source-map-support/register';
// import * as cdk from 'aws-cdk-lib';
// import { S3DeploymentStack } from '../lib/core/s3-deployment-stack';
// import { AssetStorage } from '../lib/core/cme-stack/storage'; // Import the AssetStorage construct

// const app = new cdk.App();

// // Create an instance of AssetStorage to get the hosting bucket
// const storage = new AssetStorage(app, 'Storage');

// // Create an instance of S3DeploymentStack and pass the hosting bucket to it
// new S3DeploymentStack(app, 'S3DeploymentStack', {
//   hostingBucket: storage.hostingBucket,
// });



