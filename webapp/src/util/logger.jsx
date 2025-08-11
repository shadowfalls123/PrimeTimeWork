const isProduction = process.env.NODE_ENV === "production";

const logger = {
  log: (...args) => !isProduction && console.log(...args),
  warn: (...args) => !isProduction && console.warn(...args),
  error: (...args) => console.error(...args), // Keep error logs
};

export default logger;
