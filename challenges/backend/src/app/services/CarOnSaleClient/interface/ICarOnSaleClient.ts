import { AxiosResponse } from 'axios';

/**
 * This service describes an interface to access auction data from the CarOnSale API.
 */
export interface IAuthenticationResult {
  authenticated: boolean;
  userId: string;
  token: string;
}

export interface IAuction {
  numBids: number;
  currentHighestBidValue: number;
  minimumRequiredAsk: number;
}

export interface IRunningAuctions {
  items: IAuction[];
  page: number;
  total: number;
}

export interface ICarOnSaleClient {
  getRunningAuctions(): Promise<AxiosResponse<IRunningAuctions>>;
  setAuthenticationParams(email: string, password: string): void;
  authenticate(): Promise<boolean>;
}
