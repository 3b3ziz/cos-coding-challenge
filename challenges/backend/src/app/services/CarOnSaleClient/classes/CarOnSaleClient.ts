import { AxiosResponse } from 'axios';
import { injectable } from 'inversify';
import { axiosInstance } from '../axiosInstance';
import { CREATE_AUTH_TOKEN_ENDPOINT, LIST_RUNNING_AUCTIONS_ENDPOINT } from '../config';
import { ICarOnSaleClient, IAuthenticationResult, IRunningAuctions } from '../interface/ICarOnSaleClient';
import 'reflect-metadata';

@injectable()
export class CarOnSaleClient implements ICarOnSaleClient {
  isAuthenticated: boolean = false;

  // Being authenticated is not required to allow public endpoints to be consumed through this client
  email!: string;
  password!: string;

  token!: string;
  userId!: string;

  public constructor() {}

  public setAuthenticationParams(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  private setAuthToken(authenticated: boolean, token: string, userId: string) {
    this.isAuthenticated = authenticated;
    this.token = token;
    this.userId = userId;
  }

  private createAuthToken(email: string, password: string): Promise<AxiosResponse<IAuthenticationResult>> {
    return axiosInstance.put(CREATE_AUTH_TOKEN_ENDPOINT(email), { password });
  }

  public async authenticate(): Promise<boolean> {
    try {
      const { data: authResult } = await this.createAuthToken(this.email, this.password);
      const { authenticated, token, userId } = authResult;
      this.setAuthToken(authenticated, token, userId);
    } catch (error) {
      return false;
    }

    return this.isAuthenticated;
  }

  public getRunningAuctions(count = false, filter = undefined): Promise<AxiosResponse<IRunningAuctions>> {
    return this.isAuthenticated
      ? axiosInstance.get(LIST_RUNNING_AUCTIONS_ENDPOINT(), {
          headers: {
            authtoken: this.token,
            userid: this.userId
          },
          params: {
            count,
            ...(filter ? { filter } : {})
          }
        })
      : process.exit(-1);
  }
}
