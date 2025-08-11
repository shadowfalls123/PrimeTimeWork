// This method checks if a user is logged in and retrieves user information. If the user is not authenticated, it will throw an error.
// This method is lightweight and ideal if you need basic user details like the username or userId. However, it won't provide detailed session tokens.

import { getCurrentUser } from '@aws-amplify/auth';
import logger from "./logger";

export async function checkIfUserLoggedIn() {
  try {
    const user = await getCurrentUser();
    logger.log('User is logged in:', user);
    return user;
  } catch (error) {
    logger.log('No user is logged in:', error);
    return null;
  }
}



