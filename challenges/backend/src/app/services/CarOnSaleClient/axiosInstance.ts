import axios, { AxiosResponse, AxiosError } from 'axios';
import { constants } from 'http2';
// @ts-ignore
import httpAdapter from 'axios/lib/adapters/http';
import { BASE_URL } from './config';
import { Logger } from '../Logger/classes/Logger';
import { ILogger } from '../Logger/interface/ILogger';

const isExpectedStatusCode = (code: number) =>
  [constants.HTTP_STATUS_BAD_REQUEST, constants.HTTP_STATUS_UNAUTHORIZED].includes(code);

const axiosInstance = axios.create({
  adapter: httpAdapter,
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 5000
});

axiosInstance.interceptors.response.use(
  function (response: AxiosResponse) {
    return response;
  },
  function (error: AxiosError) {
    const logger: ILogger = new Logger();
    const statusCode = error?.response?.status;
    const errorMessage = error?.response?.data?.message;
    // Might use either https://www.npmjs.com/package/retry-axios or https://www.npmjs.com/package/axios-retry
    // to handle retries

    // If unexpected error (e.g. the service is failing), service exits with error -1
    if (statusCode && isExpectedStatusCode(statusCode)) {
      logger.error(errorMessage || error.message);
      return Promise.reject(error);
    }
    logger.error(error.message);
    process.exit(-1);
    return Promise.reject(error);
  }
);

export { axiosInstance };
