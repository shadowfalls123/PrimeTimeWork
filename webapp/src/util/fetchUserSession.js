// If you need detailed session information, such as access tokens or ID tokens, you can use fetchAuthSession.
// This method automatically refreshes expired tokens if a valid refreshToken is available. Use it when you need token-based information.

import { fetchAuthSession } from '@aws-amplify/auth';
import logger from "./logger";

export async function checkSession() {
  try {
    const session = await fetchAuthSession();
    const { accessToken, idToken } = session.tokens ?? {};
    logger.log('Access Token:', accessToken);
    logger.log('ID Token:', idToken);
    logger.log('ID Token idToken.toString():', idToken.toString());
    logger.log('idToken?.payload["cognito:groups"] : ', idToken?.payload["cognito:groups"]);
    return session;
  } catch (error) {
    logger.log('Session not available:', error);
    return null;
  }
}