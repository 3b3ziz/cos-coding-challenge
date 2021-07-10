import { Container } from 'inversify';
import { ILogger } from './services/Logger/interface/ILogger';
import { ICarOnSaleClient } from './services/CarOnSaleClient/interface/ICarOnSaleClient';
import { Logger } from './services/Logger/classes/Logger';
import { CarOnSaleClient } from './services/CarOnSaleClient/classes/CarOnSaleClient';
import { DependencyIdentifier } from './DependencyIdentifiers';
import { AuctionMonitorApp } from './AuctionMonitorApp';

/*
 * Create the DI container.
 */
const container = new Container({
  defaultScope: 'Singleton'
});

/*
 * Register dependencies in DI environment.
 */
container.bind<ILogger>(DependencyIdentifier.LOGGER).to(Logger);
container.bind<ICarOnSaleClient>(DependencyIdentifier.I_CAR_ON_SALE_CLIENT).to(CarOnSaleClient);

/*
 * Inject all dependencies in the application & retrieve application instance.
 */
const app = container.resolve(AuctionMonitorApp);

/*
 * Start the application
 */
(async () => {
    await app.start();
})();
