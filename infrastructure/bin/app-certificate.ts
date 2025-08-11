#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyCertificateStack } from '../lib/core/certificate-stack/certificate';

const app = new cdk.App();
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

console.log('stackNamePrefix value is -->> ', stackNamePrefix);
new MyCertificateStack(app, `${stackNamePrefix}MyCertificateStack`, {
  stackName: `${stackNamePrefix}MyCertificateStack`
  // Add other required parameters for MyCertificateStack
  
});
