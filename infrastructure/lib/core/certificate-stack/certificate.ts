import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as dotenv from 'dotenv';
import * as path from 'path';

// import * as route53 from 'aws-cdk-lib/aws-route53';
// import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

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

export class MyCertificateStack extends cdk.Stack {

  // Export the certificate
  public readonly certificate: acm.Certificate;

  //   constructor(scope: Construct, id: string) {
  //     super(scope, id);

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const certificateDomainNames = process.env.CERTIFICATE_DOMAIN_NAMES;
    if (!certificateDomainNames) {
      throw new Error('CERTIFICATE_DOMAIN_NAMES environment variable not defined');
    }
    // Define the domain names
//    const domainNames = ['kodinghut.in', 'exam.kodinghut.in'];
//      const domainNames = certificateDomainNames.split(',');
      const domainNames = certificateDomainNames.split(',').map(domain => domain.trim()); // Trim spaces

    // Create the Certificate
    this.certificate = new acm.Certificate(this, `${stackNamePrefix}MyCertificate`, {
      domainName: domainNames[0],
      subjectAlternativeNames: domainNames.slice(1),
      validation: acm.CertificateValidation.fromDns(), // Use DNS validation
    });

    // Export the certificate ARN
    new cdk.CfnOutput(this, `${stackNamePrefix}CertificateARN`, {
      value: this.certificate.certificateArn,
      exportName: `${stackNamePrefix}CertificateARN`, // Provide a unique export name for the certificate ARN
    });

    // Assuming you already have a hosted zone for "kh.in" in Route 53
    // If not, you can create a hosted zone using CDK as well

    // // Retrieve the existing Route 53 hosted zone for "kh.in"
    // const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    //   domainName: 'kh.in',
    //   privateZone: false, // Set to true if it's a private hosted zone
    // });

    // // Add a DNS validation record to the certificate
    // new route53.CnameRecord(this, 'CertificateValidationRecord', {
    //   zone: hostedZone,
    //   recordName: '_acme-challenge.' + certificate.certificateDomainName,
    //   domainName: certificate.certificateValidationDomainName,
    // });
  }
}

// const app = new cdk.App();
// new MyCertificateStack(app, 'MyCertificateStack');

