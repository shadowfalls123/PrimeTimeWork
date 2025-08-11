import { Construct } from 'constructs';
import { Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

type NodejsServiceFunctionProps = NodejsFunctionProps & {
  architecture?: Architecture;
  memorySize?: number; // Specify memory size
};

const environmentType = process.env.NODE_ENV?.trim();  // Fetch your environment type here

export class NodejsServiceFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps) {
    const runtime = props.runtime ?? Runtime.NODEJS_16_X;
    const handler = 'handler';
    const bundling = {
     externalModules: ['aws-sdk'],
      // externalModules: ['@aws-sdk/client-s3', '@aws-sdk/client-dynamodb', '@aws-sdk/client-lambda', '@aws-sdk/client-ses', '@aws-sdk/client-textract', '@aws-sdk/client-eventbridge', '@aws-sdk/client-cognito-identity-provider'],

    };

    // const environment = {
    //   ...props.environment,
    //   NODE_ENV: 'development', // Set the NODE_ENV environment variable
    // };

    const environment = {
      ...props.environment,
      NODE_ENV: environmentType!, // Non-null assertion, you can assert that environmentType is not undefined before assigning it to the NODE_ENV property. Here using a non-null assertion (!) to tell TypeScript that environmentType will not be undefined:
    };

    super(scope, id, {
      ...props,
      runtime,
      handler,
      bundling,
      architecture: props.architecture ?? Architecture.ARM_64,
      memorySize: props.memorySize ?? 128, // Default memory size is 512 MB
      environment,
    });
  }
}



/*
//The below code uses the X86 processor by default. 

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

type NodejsServiceFunctionProps = NodejsFunctionProps;

export class NodejsServiceFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps) {
    const runtime = props.runtime ?? lambda.Runtime.NODEJS_16_X;
    const handler = 'handler';
    const bundling = {
      externalModules: ['aws-sdk'],
    };
    super(scope, id, {
      ...props,
      runtime,
      handler,
      bundling,
    });
  }
}
*/
