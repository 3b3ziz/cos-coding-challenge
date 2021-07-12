import sinon from 'sinon';
import axios from 'axios';
import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import chaiSinon from 'sinon-chai';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';
import { CarOnSaleClient } from './CarOnSaleClient';


chai.should();
chai.use(chaiThings);
chai.use(chaiSinon);

const EMAIL = 'salesman@random.com';
const PASSWORD = '123test';

describe('CarOnSaleClient getRunningAuctions', function () {
  afterEach(() => {
    sinon.restore();
  });
  it.only('should exit the process if the server is returning 500', async function () {
    const processStub = sinon.stub(process, 'exit');
    sinon.stub(axios, 'put').rejects('CarOnSale server is not responding');

    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient(console);

    carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    await carOnSaleClient.authenticate();
    expect(processStub).to.be.calledWith(-1);
  });

  it('should successfully retrieve a list of all running auctions visible to the given buyer user.', async function () {
    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient(console);
    carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    const isAuthenticated = await carOnSaleClient.authenticate();
    if (isAuthenticated) {
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
    }
  });

  it('should exit the process if called while unauthenticated', async function () {
    const processStub = sinon.stub(process, 'exit');

    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient(console);
    await carOnSaleClient.getRunningAuctions();

    expect(processStub).to.be.calledWith(-1);
  });
});
