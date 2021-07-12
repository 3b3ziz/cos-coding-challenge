import { inject, injectable } from 'inversify';
import { isNil, negate } from 'lodash';
import { pick } from 'lodash/fp';

import { ILogger } from './services/Logger/interface/ILogger';
import { IAuction, ICarOnSaleClient } from './services/CarOnSaleClient/interface/ICarOnSaleClient';
import { DependencyIdentifier } from './DependencyIdentifiers';
import 'reflect-metadata';

const EMAIL = 'salesman@random.com';
const PASSWORD = '123test';

const summationReducer = (accumulator: number, currentValue: number) => accumulator + currentValue;
const hasNullValues = (element: Object) => Object.values(element).some(isNil);

const calculateAuctionProgress = ({ currentHighestBidValue, minimumRequiredAsk }: IAuction) =>
  currentHighestBidValue / minimumRequiredAsk;

const getValidRunningAuctions = (auctions: IAuction[]) =>
  auctions
    // extract only required attributes
    .map(pick(['numBids', 'currentHighestBidValue', 'minimumRequiredAsk']))
    // remove objects with null values
    .filter(negate(hasNullValues));

@injectable()
export class AuctionMonitorApp {
  public constructor(
    @inject(DependencyIdentifier.LOGGER) private logger: ILogger,
    @inject(DependencyIdentifier.I_CAR_ON_SALE_CLIENT) private carOnSaleClient: ICarOnSaleClient
  ) {}

  public async start(): Promise<void> {
    this.logger.log(`Auction Monitor started.`);

    this.carOnSaleClient.setAuthenticationParams(EMAIL, PASSWORD);
    const isAuthenticated = await this.carOnSaleClient.authenticate();

    if (isAuthenticated) {
      const { data: runningAuctions } = await this.carOnSaleClient.getRunningAuctions();
      const { total: numberOfAuctions, items: runningAuctionItems } = runningAuctions;

      const validRunningAuctionItems = getValidRunningAuctions(runningAuctionItems);

      const totalNumberOfBids = validRunningAuctionItems.map(({ numBids }) => numBids).reduce(summationReducer);
      const averageNumberOfBids = totalNumberOfBids / numberOfAuctions;

      const totalAuctionProgress = validRunningAuctionItems.map(calculateAuctionProgress).reduce(summationReducer);
      const averageAuctionProgress = totalAuctionProgress / numberOfAuctions;

      this.logger.log('Results:');
      this.logger.log(`The number of auctions: ${numberOfAuctions}`);
      this.logger.log(`The average number of bids on an auction: ${averageNumberOfBids}`);
      this.logger.log(`the average percentage of the auction progress: ${averageAuctionProgress}`);
    }
  }
}
