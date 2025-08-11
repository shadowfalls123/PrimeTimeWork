# Welcome to your CDK TypeScript project!

This is a CDK stack developed using TypeScript for creating basic infrastucture containing Authentication using AWS Cognito User Pool, API Gateway, S3, Lambda, Step Function for extracting text from documents and DynamoDB.

Imporant to note is that the "services" folder is outside the infrastucture folder and maynot get pushed in github. Refer the overall project pushed in Github for the complete structure.
my-sample-template-codebase

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

Command References
Setup on new machine.

1. Install aws-cdk

# npm install -g aws-cdk

2. Install aws-cli

# download it from https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html or use the below command

# msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

3. Configure user / Creating aws profile on system

# aws configure --profile <profile name>

# aws configure --profile dev

# aws configure --profile uat

# aws configure --profile prod

Do npm install in the infra and service/\* folders

# npm install

For multiple profiles, specify "--profile dev" or "--profile prod" along with cdk deploy and cdk bootstrap and cdk synth commands. Before bootstrap or deployment see if the app is build as the s3 deployment will look for build folder under webapp

# set NODE_ENV=development && cdk bootstrap --profile dev

# set NODE_ENV=uat && cdk bootstrap --profile uat

# set NODE_ENV=production && cdk bootstrap --profile prod

# cdk synth --profile dev

# cdk synth --profile uat

# cdk synth --profile prod

Set the NODE_ENV environment variable when deploying your CDK stack. For example, when deploying to the Dev environment: use command

For command prompt use below command for dev environment - Before bootstrap or deployment see if the app is build as the s3 deployment will look for build folder under webapp

# set NODE_ENV=development && cdk deploy dev-MyCertificateStack --profile dev

# set NODE_ENV=development && cdk deploy dev-CMEInfraStack --profile dev

For PowerShell use for dev environment ->

# $env:NODE_ENV = "development"; cdk deploy dev-CMEInfraStack --profile dev

******\******* UAT Commands ********\*********
For command prompt use below command for dev environment

# set NODE_ENV=uat && cdk deploy uat-MyCertificateStack --profile uat

# set NODE_ENV=uat && cdk deploy uat-CMEInfraStack --profile uat

For PowerShell use for dev environment ->

# $env:NODE_ENV = "uat"; cdk deploy uat-CMEInfraStack --profile uat

******\*\*\*\*******Production Setup Start**********\***********
For creating the Certificate stack, use the below command. Replace the "KhCrackMyExamStackJan23" with appropriate parent stackname. Check the parent stack name in the bin folder

# set NODE_ENV=production && cdk deploy prod-MyCertificateStack --profile prod

For command prompt use below command for prod environment
Importent - before deploying to production make sure that you have built the web application for the production environment

# set NODE_ENV=production && cdk deploy prod-CMEInfraStack --profile prod

# set NODE_ENV=production && cdk deploy prod-S3DeploymentStack --profile prod

Once the cloudfront is setup, add alternate domain name manually in cloudfront. This step has not been added in the cdk code.

With respect to Webapp make the below change. Also check for more details in the webapp readme file.

1. Update the CNAME in GoDaddy with the newly created aws cloufront endpoint. For a root domain update the www entry in GoDaddy with the cloudfront endpoint. (add a . in the end) say the domain is examsarefun.com. In GoDaddy the CNAME defalut entry would be WWW pointing to examsarefun.com, replace the examsarefun.com with the cloudfront Distribution domain name.
2. Add alternate domain names (say for dev add examtest.kodinghut.in and for prod exam.kodinghut.in) in cloudfront
3. Go to Cognito -> App integration -> Click the App client name -> Edit the Hosted UI -> Add Google and Facebook as the Identity providers
4. Add the ApiEndPoint in the webapp/public/config.js as below:
   Content of config.js
   window['appConfig'] = {"apiEndpoint":"https://csy94ua4h8.execute-api.us-east-1.amazonaws.com"};
5. Update the cognito parameters(aws_user_pools_id, aws_user_pools_web_client_id) in the env files for the aws-exports file.
6. Rebuild the Webapp
7. Run the infra stack again so that the newly build webapp with the api endpoint and aws-export parameters is deployed on s3
   For Certificate setup
8. Create the MyCertificate Stack
9. Go to Certificate Manage in AWS Console. The certicate will be with the status as "Pending validation" in certificate manager.
10. Click on the newly create certificate
11. Copy the "CNAME name" and "CNAME value" from Certificate Manager and add it in GoDaddy. Copy "CNAME name" from aws certificate manager without the ".examarefun.com" or "kodinghut.in." in GoDadddy CNAME name and copy the "CNAME value" from certificate manager as it is in GoDaddy. For example the CNAME name in AWS Certificate manager is \_b82b323b83371hjsd67388dhhddb15.examsarefun.com. so just add the CNAME name in Godaddy as \_b82b323b83371hjsd67388dhhddb15 without the ".examarefun.com" and CNAME value is \_bac85740fa86b5b640dc36351096d998.mhbtsbpdnt.acm-validations.aws. if you have subdomain like \_487ceeb5e2fe0230e8629c390d98258c.exam.kodinghut.in. in the name then you need to copy the name along with the subdomain like \_487ceeb5e2fe0230e8629c390d98258c.exam and cname value as it is in GoDaddy
12. Once you add the details in GoDaddy , it will take sometime and the Pending verification should change to Issued
13. For the certificatte the "Renewal eligibility" will be shown as "Ineligible". As soon as we attached a cloudfront distribution to the certificate, the certificate would be marked as in use and now Eligible for Renewal eligibility.
    ******\*\*\*\*******Production Setup End**********\***********

******\*\*\*\*******Delete Stack**********\***********
When the "CMEInfraStack" stack is deleted from the console the below items needs to be delete manually

1. S3 bucktes
2. DynamoDB Tables
3. Cognito User Pool
