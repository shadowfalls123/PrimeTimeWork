// config.uat.js
const config = {
  websiteUrl: 'https://www.exam.kodinghut.in', // Production website URL
  awsRegion: 'us-east-1',
  cognito: {
    awsCognitoRegion: 'us-east-1',
    cognitoUserPoolId: 'us-east-1_tGJvZ2Z5Q',
    cognitoUserPoolWebClientId: '52sefat2mbp4m5j4bjp10l0qlt',
    cognitoDomain: 'kodinghut.auth.us-east-1.amazoncognito.com',
    redirectSignIn: "https://www.exam.kodinghut.in/callback", // Production callback URL
    redirectSignOut: "https://www.exam.kodinghut.in/logout", // Production logout URL
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