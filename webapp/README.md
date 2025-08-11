# Welcome to XtractText!

This is a react application for Text Extraction from documents (OCR) working along with the CDK template build using TypeScript.
Using this application you can upload a PDF file and the application will extract the text and store it in DynamoDB database. As of now the extracted text is stored in the Database and is not displayed on the website.

Few things to setup before it can work.

1. Add the ApiEndPoint in the webapp/public/config.js as below:
   Content of config.js
   window['appConfig'] = {"apiEndpoint":"https://csy94ua4h8.execute-api.us-east-1.amazonaws.com"};

---

2. Add aws_user_pools_id and aws_user_pools_web_client_id in the \webapp\src\aws-exports.js file

   Content of sample aws-exports.js
   const awsmobile = {
   "aws_project_region": "us-east-1",
   "aws_cognito_identity_pool_id": "us-east-1:ce20c0d8-d52a-45f8-9065-98de3e993e7c",
   "aws_cognito_region": "us-east-1",
   "aws_user_pools_id": "us-east-1_xIZBBbMS6",
   "aws_user_pools_web_client_id": "7h8tobm9ks3r0qss147g8mu6g5",
   "oauth": {},
   "aws_cognito_username_attributes": [
   "EMAIL"
   ],
   "aws_cognito_social_providers": [],
   "aws_cognito_signup_attributes": [
   "EMAIL"
   ],
   "aws_cognito_mfa_configuration": "OFF",
   "aws_cognito_mfa_types": [
   "SMS"
   ],
   "aws_cognito_password_protection_settings": {
   "passwordPolicyMinLength": 8,
   "passwordPolicyCharacters": []
   },
   "aws_cognito_verification_mechanisms": [
   "EMAIL"
   ]
   };
   export default awsmobile;

---

3. npm install for installing all the dependencies
4. npm build to build the application
5. Deploy the application using the infrastructure project
6. Keep in mind that the Infrastructure project build using CDK uses CloudFront and few things may be cached in CloudFront and may not reflect the changes immediately

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

CME Notes

For prod deployment remember to update the api endpoint in the config file in the build folder

For building the application for dev environment use the below command (Refer the package.json for more details)

# npm run build:dev

# set REACT_APP_ENV=development && npm run build:dev

For building the application for uat environment use the below command (Refer the package.json for more details)

# npm run build:uat

# set REACT_APP_ENV=uat && npm run build:uat

For building the application for prod environment use the below command (Refer the package.json for more details)

# npm run build:prod

# set REACT_APP_ENV=production && npm run build:prod

To start the application use the below command

# npm run start:dev

For uat

# npm run start:uat

For prod

# npm run start:prod

Help Section

# Error Number 1 -
"An error was encountered with the requested page.
Login option is not available. Please try another one"
and you may see the error similar to the below in in Browser console. 

GET https://kodinghutdev.auth.us-east-1.amazoncognito.com/error?state=H4sIAAAAAAAAAE2RW5OiMBCF_0uejXJHePOKw4yOgvetLSuEAIFAkIsKU_vfN75s7ds51d_p6jr9AxCwQVtDguoGyje8278OV4SOYAACMXE4jxkRBgtjKGmemY3EUJEZcode=4%2F0AfJohXmE4QSYZiYu-huBJbuZZ3B-k0tEzm7JqB9X-kkj_1KX6dBi2tQEugfphEhl9x4WGQ&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid&authuser=0&prompt=none 400 (Bad Request)
error:12 [Report Only] Refused to execute inline script because it violates the following Content Security Policy directive: "script-src https://d3oia8etllorh5.cloudfront.net https://kodinghutdev.auth.us-east-1.amazoncognito.com". Either the 'unsafe-inline' keyword, a hash ('sha256-fWEffNYGDN+XQ+YrsU/LKDZAnOcnSlra1fOIm+7oskM='), or a nonce ('nonce-...') is required to enable inline execution.
favicon.ico:1       
GET https://kodinghutdev.auth.us-east-1.amazoncognito.com/favicon.ico 400 (Bad Request)

This can happen because of following reasons 
1) The Social Identity providers is not added in the cognito pool 
2) The Cognito User Pool ID and App integration ID's are not properly copied in the config files which are used in aws-expoorts.js 
3) If the above 2 are not the reasons than it could be the cloudfront caching which may need to be invalidated if you have just applied the changes or wait for 24 hours for it to automatically get refreshed.

Fix - If you encounter the above error when trying to login using Google Social Login try the below solution:
Go to AWS Cognito User Pool, within the user pool go to "App Integration", click on the "App client name", go to the "Hosted UI" section and edit it. Go to the "Identity providers" section and add Google as the Identity Provider.
The same solution will also apply for Facebook and other social login Providers.

