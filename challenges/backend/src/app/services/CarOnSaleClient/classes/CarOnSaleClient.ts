import { constants } from 'http2';
import axios, { AxiosResponse } from 'axios';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { DependencyIdentifier } from '../../../DependencyIdentifiers';
import { ILogger } from '../../Logger/interface/ILogger';
import { BASE_URL, CREATE_AUTH_TOKEN_ENDPOINT, LIST_RUNNING_AUCTIONS_ENDPOINT } from '../config';
import { ICarOnSaleClient, IAuthenticationResult, IRunningAuctions } from '../interface/ICarOnSaleClient';

axios.defaults.baseURL = BASE_URL;

const isExpectedStatusCode = (code: number) =>
  [constants.HTTP_STATUS_BAD_REQUEST, constants.HTTP_STATUS_UNAUTHORIZED].includes(code);

@injectable()
export class CarOnSaleClient implements ICarOnSaleClient {
  isAuthenticated: boolean = false;

  // Being authenticated is not required to allow public endpoints to be consumed through this client
  email!: string;
  password!: string;

  token!: string;
  userId!: string;

  public constructor(@inject(DependencyIdentifier.LOGGER) private logger: ILogger) {}

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
    return axios.put(CREATE_AUTH_TOKEN_ENDPOINT(email), { password });
  }

  public async authenticate() {
    try {
      const { data: authResult } = await this.createAuthToken(this.email, this.password);
      const { authenticated, token, userId } = authResult;
      this.setAuthToken(authenticated, token, userId);
    } catch (error) {
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message;
      if (isExpectedStatusCode(statusCode)) {
        this.logger.log(`${statusCode}: ${errorMessage}`);
        return false;
      } else {
        // If unexpected error (e.g. the service is failing), service exits with error -1
        this.logger.log(error);
        process.exit(-1);
      }
    }

    return this.isAuthenticated;
  }

  public getRunningAuctions(count = false, filter = undefined): Promise<AxiosResponse<IRunningAuctions>> {
    return this.isAuthenticated
      ? axios.get(LIST_RUNNING_AUCTIONS_ENDPOINT(), {
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
