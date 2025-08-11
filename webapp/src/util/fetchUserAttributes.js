import { fetchUserAttributes } from 'aws-amplify/auth';
import logger from "./logger";

// const getUserAttributes = async ({ userAttributes }) => {
//   // Note that return type has changed from array to object
//   const attributes = await fetchUserAttributes();
// }

export async function getUserAttributes() {
  try {
  // Note that return type has changed from array to object
  const attributes = await fetchUserAttributes();
    logger.log('attributes', attributes);
    return attributes;
  } catch (error) {
    logger.log('Attributes not available:', error);
    return null;
  }
}