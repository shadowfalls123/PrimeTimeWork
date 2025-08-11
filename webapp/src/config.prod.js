// config.prod.js
const config = {
  websiteUrl: 'https://www.examsarefun.com', // Production website URL
  awsRegion: 'us-east-1',
  cognito: {
    awsCognitoRegion: 'us-east-1',
    cognitoUserPoolId: 'us-east-1_K01lnmj79',
    cognitoUserPoolWebClientId: '2rtbqf4mtsg1v0njv7i2i1t3fn',
    cognitoDomain: 'examsarefun.auth.us-east-1.amazoncognito.com',    
    redirectSignIn: "https://www.examsarefun.com/callback", // Production callback URL
    redirectSignOut: "https://www.examsarefun.com/logout", // Production logout URL
  },
  google: {
    googleClientId: '784463491373-pvuim1cl52mfi3tp0boj327eqjhigq7l.apps.googleusercontent.com',
  },
  facebook: {
    facebookAppId: '796159082017247',
    facebookAppSecret: '69441246788de583533656666e572132',
  },
};
  
export default config;