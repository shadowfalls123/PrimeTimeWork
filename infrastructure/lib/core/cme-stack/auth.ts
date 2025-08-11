import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as path from 'path';

//dotenv.config();
// const { GOOGLE_CLIENT_ID } = process.env;
// const { FACEBOOK_APP_ID } = process.env;
//const WEBSITE_URL = 'https://exam.kodinghut.in'; // Update with your website URL using HTTPS

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

// Retrieve the WEBSITE_URL from the environment variables
const websiteUrl = process.env.WEBSITE_URL;
const domainForUserPool = process.env.USERPOOL_DOMAIN;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
 

export class ApplicationAuth extends Construct {
  public readonly userPool: cognito.IUserPool;

  public readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    console.log('websiteUrl value is -->> ', websiteUrl);
    console.log('domainForUserPool value is -->> ', domainForUserPool);
    console.log('googleClientId value is -->> ', googleClientId);
    console.log('facebookAppId value is -->> ', facebookAppId);

    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
      signInAliases: {
        email: true,
      },
      // standardAttributes: {
      //   fullname: {
      //     required: true,
      //     mutable: true,
      //   },
      //   phoneNumber: {
      //     required: false,
      //     mutable: true,
      //   },
      //   profilePicture: {
      //     required: false,
      //     mutable: true,
      //   },
      // },
    });

    const userPoolDomain = new cognito.CfnUserPoolDomain(this, 'UserPoolDomain', {
      domain: `${domainForUserPool}`, // Replace with your desired Cognito domain prefix
      userPoolId: this.userPool.userPoolId,
    });

    this.userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        callbackUrls: [
          `${websiteUrl}/callback`,
          // `http://localhost:3000/callback`
      ],
        logoutUrls: [
          `${websiteUrl}/logout`,
          // `http://localhost:3000/logout`
        ],

        // callbackUrls: ['https://exam.kodinghut.in'],
        // logoutUrls: ['https://exam.kodinghut.in'],
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
      },
    });

//      // Configure Google provider settings
//      new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
//       clientId: GOOGLE_CLIENT_ID,
//       userPool: this.userPool,
//       attributeMapping: {
//         email: cognito.ProviderAttribute.GOOGLE_EMAIL,
// //        name: cognito.ProviderAttribute.GOOGLE_NAME,
//       },
//     });


    const googleProvider = new cognito.CfnUserPoolIdentityProvider(this, 'GoogleProvider', {
      providerName: 'Google',
      providerType: 'Google',
      userPoolId: this.userPool.userPoolId,
      providerDetails: {
        client_id: googleClientId,
        client_secret: googleClientSecret, // Replace with your actual Google client secret
        authorize_scopes: 'email openid profile',
      },
      attributeMapping: {
        email: 'email',
        name: 'name',
      },
    });
    
// const scopes = ['email', 'public_profile']; // Add any additional scopes you require for Facebook login


const resource = new cognito.CfnUserPoolIdentityProvider(this, 'Resource', {
  userPoolId: this.userPool.userPoolId,
  providerName: 'Facebook', // must be 'Facebook' when the type is 'Facebook'
  providerType: 'Facebook',
  providerDetails: {
    client_id: facebookAppId,
    client_secret: facebookClientSecret,
    authorize_scopes: 'email public_profile',
  },
  attributeMapping: {
    email: 'email',
    name: 'name',
  },
});

    // Groups -----------------------------------------------------------------------

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admin',
      precedence: 1,
      description: 'Admin users',
    });
    
    new cognito.CfnUserPoolGroup(this, 'ContributorGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'contributor',
      precedence: 3,
      description: 'Users who can manage exam but not users',
    });

    new cognito.CfnUserPoolGroup(this, 'TutorGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'tutor',
      precedence: 4,
      description: 'Users who can create, update and delete exams & questions',
    });

    new cognito.CfnUserPoolGroup(this, 'QuestioncontributorGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'questioncontributor',
      precedence: 6,
      description: 'Users who can add, update & delete questions',
    });

    new cognito.CfnUserPoolGroup(this, 'StudentGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'student',
      precedence: 8,
      description: 'Users who can purchase and take exams and view results',
    });


    new cognito.CfnUserPoolGroup(this, 'ReaderGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'reader',
      precedence: 10,
      description: 'Users who can only read and comment',
    });
  }
}
