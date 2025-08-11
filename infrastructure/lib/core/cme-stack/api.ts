import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
//import { CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';

import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
//import * as apigw from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigi from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { aws_apigatewayv2 as apigatewayv2 } from 'aws-cdk-lib'; 

interface ApplicationAPIProps {
  questionsService: lambda.IFunction;
  // commentsService: lambda.IFunction;
  // documentsService: lambda.IFunction;
  usersService: lambda.IFunction;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
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

export class ApplicationAPI extends Construct {
public readonly httpApi: apigw.HttpApi;

  constructor(scope: Construct, id: string, props: ApplicationAPIProps) {
    super(scope, id);

    const serviceMethods = [
      apigw.HttpMethod.GET,
      apigw.HttpMethod.POST,
      apigw.HttpMethod.DELETE,
      apigw.HttpMethod.PUT,
      apigw.HttpMethod.PATCH,
    ];

    // API Gateway ------------------------------------------------------

    this.httpApi = new apigw.HttpApi(this, 'HttpProxyApi', {
      apiName: 'crackmyexam-api',
      createDefaultStage: true,
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type', '*'],
        allowMethods: [
          apigw.CorsHttpMethod.GET,
          apigw.CorsHttpMethod.POST,
          apigw.CorsHttpMethod.DELETE,
          apigw.CorsHttpMethod.PUT,
          apigw.CorsHttpMethod.PATCH,
        ],
        allowOrigins: ['http://localhost:3000', 'https://*'],
        allowCredentials: true,
        maxAge: cdk.Duration.days(10),
      },
    });

        // Authorizer -------------------------------------------------------

        const authorizer = new HttpUserPoolAuthorizer('Authorizer', props.userPool, {
          userPoolClients: [props.userPoolClient],
        });


    // Questions Service -------------------------------------------------
        
    const questionsServiceIntegration = new apigi.HttpLambdaIntegration('QuestionsServiceIntegration',
      props.questionsService, {});

    this.httpApi.addRoutes({
      path: `/questions/{proxy+}`,
      methods: serviceMethods,
      integration: questionsServiceIntegration,
      authorizer,
    });

        // // Comments Service -------------------------------------------------
        
    // const commentsServiceIntegration = new apigi.HttpLambdaIntegration('CommentsServiceIntegration',
    //   props.commentsService, {});

    // this.httpApi.addRoutes({
    //   path: `/comments/{proxy+}`,
    //   methods: serviceMethods,
    //   integration: commentsServiceIntegration,
    //   authorizer,
    // });

    //    // Documents Service ------------------------------------------------

    //    const documentsServiceIntegration = new apigi.HttpLambdaIntegration('DocumentsServiceIntegration',
    //    props.documentsService, {});
   
    //    this.httpApi.addRoutes({
    //      path: `/documents/{proxy+}`,
    //      methods: serviceMethods,
    //      integration: documentsServiceIntegration,
    //      authorizer,
    //    });
   
      //  // Users Service ------------------------------------------------------
   
       const usersServiceIntegration = new apigi.HttpLambdaIntegration('UsersServiceIntegration',
       props.usersService, {});
   
       this.httpApi.addRoutes({
         path: `/users/{proxy+}`,
         methods: serviceMethods,
         integration: usersServiceIntegration,
         authorizer,
       });
   
    // // Moderate ----------------------------------------------------------

    // const queue = new sqs.Queue(this, 'ModerationQueue');

    // const moderateRole = new iam.Role(this, 'ModerateRole', {
    //   assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    // });

    // moderateRole.addToPolicy(
    //   new iam.PolicyStatement({
    //     resources: [queue.queueArn],
    //     actions: ['sqs:SendMessage'],
    //   }),
    // );

    // const sqsIntegration = new apigatewayv2.CfnIntegration(this, 'ModerateIntegration', {
    //   apiId: this.httpApi.apiId,
    //   integrationType: 'AWS_PROXY',
    //   integrationSubtype: 'SQS-SendMessage',
    //   credentialsArn: moderateRole.roleArn,
    //   requestParameters: {
    //     QueueUrl: queue.queueUrl,
    //     MessageBody: '$request.body',
    //   },
    //   payloadFormatVersion: '1.0',
    //   timeoutInMillis: 10000,
    // });

    // new apigatewayv2.CfnRoute(this, 'ModerateRoute', {
    //   apiId: this.httpApi.apiId,
    //   routeKey: 'POST /moderate',
    //   target: `integrations/${sqsIntegration.ref}`,
    // });

    // // Outputs -----------------------------------------------------------

    new cdk.CfnOutput(this, `${stackNamePrefix}URL`, {
      value: this.httpApi.apiEndpoint
    });

  }
}
