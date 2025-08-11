import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

// Load the appropriate .env file based on the deployment environment
const environmentType = process.env.NODE_ENV?.trim(); 

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


export class AssetStorage extends Construct {
 public readonly uploadBucket: s3.IBucket;

  public readonly hostingBucket: s3.IBucket;

 public readonly assetBucket: s3.IBucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.uploadBucket = new s3.Bucket(this, 'UploadBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    this.assetBucket = new s3.Bucket(this, 'AssetBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    this.hostingBucket = new s3.Bucket(this, 'CrackMyExamWebHostingBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Export the hosting bucket ARN
    new cdk.CfnOutput(this, `${stackNamePrefix}CMEHostingBucketARN`, {
      value: this.hostingBucket.bucketArn,
      exportName: `${stackNamePrefix}CMEHostingBucketARN`,
    });

  }
}
