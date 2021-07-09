import axios, { AxiosResponse } from 'axios';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';

const BASE_URL = 'https://api-core-dev.caronsale.de/api';
const CREATE_AUTH_TOKEN_ENDPOINT = (email: string) => `/v1/authentication/${email}`;
const LIST_RUNNING_AUCTIONS_ENDPOINT = () => `/v2/auction/buyer/`;

const EMAIL = 'salesman@random.com';
const PASSWORD = '123test';

axios.defaults.baseURL = BASE_URL;

@injectable()
export class CarOnSaleClient implements ICarOnSaleClient {
  public constructor() {}

  private async createAuthToken(email: string, password: string): Promise<AxiosResponse<any>> {
    return axios.put(CREATE_AUTH_TOKEN_ENDPOINT(email), { password });
  }

  public async getRunningAuctions(): Promise<AxiosResponse<any>> {
    try {
      const { data: authResult } = await this.createAuthToken(EMAIL, PASSWORD);
      const { token, userId } = authResult;

      return axios.get(LIST_RUNNING_AUCTIONS_ENDPOINT(), {
        headers: {
          authtoken: token,
          userid: userId
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
