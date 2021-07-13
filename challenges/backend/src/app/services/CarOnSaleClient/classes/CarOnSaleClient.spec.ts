import nock from 'nock';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import chaiThings from 'chai-things';
import chaiSinon from 'sinon-chai';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';
import { CarOnSaleClient } from './CarOnSaleClient';
import { BASE_URL, CREATE_AUTH_TOKEN_ENDPOINT } from '../config';

// TODO: should be moved in a config file to run once since test files would increase later.
const nockBack = nock.back;

chai.should();
chai.use(chaiThings);
chai.use(chaiSinon);

const EMAIL = 'salesman@random.com';
const PASSWORD = '123test';

describe('CarOnSaleClient getRunningAuctions', function () {
  afterEach(() => {
    sinon.restore();
    nockBack.setMode('dryrun');
  });
  it('should successfully retrieve a list of all running auctions visible to the given buyer user.', async function () {
    nockBack.setMode('record');
    nockBack.fixtures = __dirname + '/nockFixtures';

    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient();
    carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    nockBack('successfulAuthentication.json', async (nockDone) => {
      const isAuthenticated = await carOnSaleClient.authenticate();
      nockDone();
      expect(isAuthenticated).to.equal(true);

      if (isAuthenticated) {
        nockBack('successfulRunningAuctions.json', async (nockDone) => {
          const { data: runningAuctions } = await carOnSaleClient.getRunningAuctions();
          nockDone();

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
      }
    });
  });

  it('should exit the process if called while unauthenticated', async function () {
    const processStub = sinon.stub(process, 'exit');

    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient();
    await carOnSaleClient.getRunningAuctions();

    expect(processStub).to.be.calledWith(-1);
  });

  it.only('should exit the process if the server is returning 500', async function () {
    const processStub = sinon.stub(process, 'exit');
    nock(BASE_URL).put(CREATE_AUTH_TOKEN_ENDPOINT(EMAIL)).replyWithError('something awful happened');

    const carOnSaleClient: ICarOnSaleClient = new CarOnSaleClient();
    carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    await carOnSaleClient.authenticate();
    expect(processStub).to.be.calledWith(-1);
  });
});
