export const ENVIRONMENT = process.env.NODE_ENV?.trim() || "unknown";

export const TABLE_NAMES = {
  paperQuestionsTable: process.env.DYNAMO_DB_PAPERQUESTIONS_TABLE,
  packageTable: process.env.DYNAMO_DB_PACKAGE_TABLE,
  submittedPapersTable: process.env.DYNAMO_DB_SUBMITTEDPAPERS_TABLE,
  myCoursesTable: process.env.DYNAMO_DB_MYCOURSES_TABLE,
  examResultsTable: process.env.DYNAMO_DB_EXAMRESULTS_TABLE,
  examResultsHistoryTable: process.env.DYNAMO_DB_EXAMRESULTSHISTORY_TABLE,
  topRatedPapers: process.env.DYNAMO_DB_TOPRATEDPAPERS_TABLE,
  userProfileTable: process.env.DYNAMO_DB_USERPROFILE_TABLE,
  userCreditsTable: process.env.DYNAMO_DB_USERCREDITS_TABLE,
  paymentHistoryTable: process.env.DYNAMO_DB_PAYMENTHISTORY_TABLE,
};

export const userPoolID = process.env.USER_POOL_ID;
export const assetBucket = process.env.ASSET_BUCKET;

export const PAYMENT_CONFIG = {
  razorpay: {
    razorPayKeyId: process.env.RAZORPAY_KEY_ID,
    razorPayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  },
  phonepe: {
    phonepeUrl: process.env.PHONEPE_URL,
    phonepeMerchantId: process.env.PHONEPE_MERCHANT_ID,
    phonepeMerchantUserId: process.env.PHONEPE_MERCHANT_USER_ID,
    phonepeKeySecret: process.env.PHONEPE_KEY_SECRET,
    phonepeKeyIndex: process.env.PHONEPE_KEYINDEX,
  },
  openAPI: {
    openAPIKeyId: process.env.OPEN_API_KEY_ID,
    openAPIKeySecret: process.env.OPEN_API_KEY_SECRET,
  },
};
