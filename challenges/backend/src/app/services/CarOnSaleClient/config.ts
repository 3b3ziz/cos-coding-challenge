export const BASE_URL = 'https://api-core-dev.caronsale.de/api';
export const CREATE_AUTH_TOKEN_ENDPOINT = (email: string) => `/v1/authentication/${email}`;
export const LIST_RUNNING_AUCTIONS_ENDPOINT = () => `/v2/auction/buyer/`;
