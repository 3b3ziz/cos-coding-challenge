import { expect } from 'chai';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';
import { CarOnSaleClient } from './CarOnSaleClient';

describe('CarOnSaleClient getRunningAuctions', function () {
  it('should return an array of auction items', async function () {
    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient();
    const { data: runningAuctions } = await carOnSaleClient.getRunningAuctions();
    expect(runningAuctions).to.be.an('object');
    expect(runningAuctions).to.have.own.property('items');
    expect(runningAuctions).to.have.own.property('page');
    expect(runningAuctions).to.have.own.property('total');
  });
});
