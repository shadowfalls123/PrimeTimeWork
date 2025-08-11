
// Determine the environment type (you might fetch this from NODE_ENV or another environment variable)
const environmentType = process.env.NODE_ENV?.trim() || "unknown";; // Fetch your environment type here

console.log(`Environment Type: ${environmentType}`);
// Define table name prefix based on the environmentType
let tableNamePrefix = "";
if (environmentType === "production") {
  tableNamePrefix = "prod";
} else if (environmentType === "development") {
  tableNamePrefix = "dev";
} else if (environmentType === "uat") {
  tableNamePrefix = "uat";
} else {
  tableNamePrefix = "unknown";
}

// Export both values
export { environmentType, tableNamePrefix };