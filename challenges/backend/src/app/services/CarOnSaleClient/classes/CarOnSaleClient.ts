import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';

@injectable()
export class CarOnSaleClient implements ICarOnSaleClient {
  public constructor() {}

  public async getRunningAuctions(): Promise<any> {
    return new Promise((resolve, _) => {
        resolve([]);
    });
  }
}
