// APIService.js
import axios from "axios";
import { fetchAuthSession } from "@aws-amplify/auth";

let apiEndpoint;

if (process.env.NODE_ENV === "production") {
  apiEndpoint = window.appConfig.apiEndpointProd;
} else if (process.env.NODE_ENV === "uat") {
  apiEndpoint = window.appConfig.apiEndpointUat;
} else {
  apiEndpoint = window.appConfig.apiEndpointDev;
}

export const SERVICES_HOST = apiEndpoint;

let client; // Singleton instance

const initializeClient = async () => {
  if (client) return client;

  const getAuthHeader = async () => {
    const session = await fetchAuthSession();
    const accessToken = session?.tokens?.accessToken;

    if (!accessToken) {
      throw new Error("No access token available.");
    }

    return `Bearer ${accessToken}`;
  };

  const authHeader = await getAuthHeader();

  client = axios.create({
    baseURL: SERVICES_HOST,
    headers: {
      Authorization: authHeader,
    },
  });

  // Axios interceptor for token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.warn("Token expired. Attempting to refresh...");
        try {
          const newAuthHeader = await getAuthHeader();
          error.config.headers.Authorization = newAuthHeader;
          return axios.request(error.config);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          throw refreshError;
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const createAPIClient = async () => {
  if (!client) {
    await initializeClient();
  }
  return client;
};
