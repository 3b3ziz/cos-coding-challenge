import { ILogger } from '../interface/ILogger';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class Logger implements ILogger {
  public constructor() {}

  public log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }

  public error(error: string | Error): void {
    const message = typeof error === 'string' ? error.toString() : error?.message;
    console.log(`[ERROR]: ${message}`);
  }
}
