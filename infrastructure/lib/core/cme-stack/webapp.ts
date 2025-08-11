import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cwt from 'cdk-webapp-tools';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { Construct } from 'constructs';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cognito from 'aws-cdk-lib/aws-cognito'
/*
import { MyCertificateStack } from "../certificate-stack/certificate";
*/
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

import { S3DeploymentStack } from '../s3-deployment-stack';

export interface WebAppProps {
  hostingBucket: s3.IBucket;
  relativeWebAppPath: string;
  baseDirectory: string;
  httpApi:apigw.IHttpApi;
  userPool:cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
//  certificate: acm.Certificate; // Use Certificate type from 'aws-cdk-lib/aws-certificatemanager'
/*  certificateArn: string; // Pass the certificate ARN as a parameter
*/
}

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


export class WebApp extends Construct {
  public readonly webDistribution: cloudfront.CloudFrontWebDistribution;


  private getCertificateFromArn(certificateArn: string): acm.ICertificate {
    return acm.Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
  }

  constructor(scope: Construct, id: string, props: WebAppProps) {
    super(scope, id);

    console.log("WebApp Base Directory:", props.baseDirectory);
    console.log("WebApp Relative Web App Path:", props.relativeWebAppPath);
    
    const oai = new cloudfront.OriginAccessIdentity(this, 'WebHostingOAI', {});

    const certificateArn = cdk.Fn.importValue(`${stackNamePrefix}CertificateARN`);
        // Use the getCertificateFromArn method to get the certificate object
        const certificate = this.getCertificateFromArn(certificateArn);
      
    const cloudfrontProps: any = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: props.hostingBucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      errorConfigurations: [
        {
          errorCachingMinTtl: 86400,
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
        {
          errorCachingMinTtl: 86400,
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html',
        },
      ],

      // Use the passed certificate
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
        certificate, // Use the certificate ARN from the parameter
//        props.certificate,
        {
//           aliases: [
// //            'kodinghut.in', 
//             'exam.kodinghut.in',
// //           props.hostingBucket.bucketRegionalDomainName,
//           ],
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021, // Specify the minimum protocol version
        },
      ),

    };

    this.webDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'AppHostingDistribution',
      cloudfrontProps,
    );

    props.hostingBucket.grantRead(oai);

    // Temporarily disabling the copy of Webapp in the S3 bucket as we are using running it from localhost for the development environment  
    if (environmentType !== 'development') {
      // Deploying WebApp using s3Deploy - Seperated the below code in a seperate stack for deployment to s3
      const deployment = new s3Deploy.BucketDeployment(this, "WebAppDeploy", {
        sources: [s3Deploy.Source.asset("../webapp/build")],
        destinationBucket: props.hostingBucket
      });
    }

    // // Create the S3 deployment stack and pass the hosting bucket to it
    // new S3DeploymentStack(this, 'S3DeploymentStack', {
    //   hostingBucket: props.hostingBucket,
    // });
    
    // // Deploy Web App ----------------------------------------------------

    // new cwt.WebAppDeployment(this, 'WebAppDeploy', {
    //   baseDirectory: props.baseDirectory,
    //   relativeWebAppPath: props.relativeWebAppPath,
    //   webDistribution: this.webDistribution,
    //   webDistributionPaths: ['/*'],
    //   buildCommand: 'npm run build',
    //   buildDirectory: 'build',
    //   bucket: props.hostingBucket,
    //   prune: false
    // });

    // Web App Config ------------------------------------------------------

    // new cwt.WebAppConfig(this, 'WebAppConfig', {
    //   bucket: props.hostingBucket,
    //   key: 'config.js',
    //   configData: {
    //     apiEndpoint: props.httpApi.apiEndpoint,
    //     userPoolId: props.userPool.userPoolId,
    //     userPoolWebClientId: props.userPoolClient.userPoolClientId,
    //   },
    //   globalVariableName: 'appConfig'
    // }).node.addDependency(deployment);
    
    new cdk.CfnOutput(this, `${stackNamePrefix}URL`, {
      value: `https://${this.webDistribution.distributionDomainName}/`
    });
  }
}