// config.dev.js
const config = {
  websiteUrl: 'http://localhost:3000', // Development website URL
  awsRegion: 'us-east-1',
  cognito: {
    awsCognitoRegion: 'us-east-1',
    cognitoUserPoolId: 'us-east-1_tGJvZ2Z5Q', // Using UAT config for development
    cognitoUserPoolWebClientId: '52sefat2mbp4m5j4bjp10l0qlt',
    cognitoDomain: 'kodinghut.auth.us-east-1.amazoncognito.com',
    redirectSignIn: "http://localhost:3000/callback", // Development callback URL
    redirectSignOut: "http://localhost:3000/logout", // Development logout URL
  },
  google: {
    googleClientId: '784463491373-drnd0a5pm2r196h2ou6skhdtfuqbldj3.apps.googleusercontent.com'
  },
  facebook: {
    facebookAppId: '796159082017247',
    facebookAppSecret: '69441246788de583533656666e572132',
  },
};
  
export default config;