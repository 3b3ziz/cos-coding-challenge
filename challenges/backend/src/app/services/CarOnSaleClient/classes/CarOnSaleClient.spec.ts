import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';
import { CarOnSaleClient } from './CarOnSaleClient';

chai.should();
chai.use(chaiThings);

describe('CarOnSaleClient getRunningAuctions', function () {
  it('should return an array of auction items', async function () {
    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient();
    const { data: runningAuctions } = await carOnSaleClient.getRunningAuctions();
    const { total: numberOfAuctions, items: runningAuctionItems } = runningAuctions;

    expect(runningAuctions).to.be.an('object');
    expect(runningAuctions).to.have.own.property('items');
    expect(runningAuctions).to.have.own.property('page');
    expect(runningAuctions).to.have.own.property('total');
    expect(numberOfAuctions).to.be.a('number');

    runningAuctionItems.should.all.have.property('currentHighestBidValue');
    runningAuctionItems.should.all.have.property('minimumRequiredAsk');
    runningAuctionItems.should.all.have.property('numBids');
  });
});
