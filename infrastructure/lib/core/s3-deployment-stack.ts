import * as cdk from 'aws-cdk-lib';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { WebAppProps } from '../core/cme-stack/webapp'; // Import the WebAppProps interface


interface S3DeploymentStackProps extends WebAppProps {
  hostingBucket: s3.IBucket;
}

export class S3DeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S3DeploymentStackProps) {
    super(scope, id);

    new s3Deploy.BucketDeployment(this, 'WebAppDeploy', {
      sources: [s3Deploy.Source.asset("../webapp/build")],
      destinationBucket: props.hostingBucket
    });
  }
}
