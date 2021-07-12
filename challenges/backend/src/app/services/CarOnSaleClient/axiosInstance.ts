import axios, { AxiosResponse, AxiosError } from 'axios';
import { constants } from 'http2';
// @ts-ignore
import httpAdapter from 'axios/lib/adapters/http';
import { BASE_URL } from './config';

const isExpectedStatusCode = (code: number) =>
  [constants.HTTP_STATUS_BAD_REQUEST, constants.HTTP_STATUS_UNAUTHORIZED].includes(code);

const axiosInstance = axios.create({
  adapter: httpAdapter,
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' }
});

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  function (error: AxiosError) {
    const statusCode = error?.response?.status;
    const errorMessage = error?.response?.data?.message;
    // Might use either https://www.npmjs.com/package/retry-axios or https://www.npmjs.com/package/axios-retry
    // to handle retries

    // If unexpected error (e.g. the service is failing), service exits with error -1
    if (statusCode && isExpectedStatusCode(statusCode)) {
      console.log(errorMessage || error.message);
      return Promise.reject(error);
    }
    console.log(error.message);
    process.exit(-1);
  }
);

export { axiosInstance };
