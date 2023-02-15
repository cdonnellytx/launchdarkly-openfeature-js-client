import { LDLogger } from 'launchdarkly-js-client-sdk';

/**
 * Logging levels. Each should correspond to a method on the logger.
 */
const LEVELS = ['error', 'warn', 'info', 'debug'];

/**
 * The safeLogger logic exists because we allow the application to pass in a custom logger, but
 * there is no guarantee that the logger works correctly and if it ever throws exceptions there
 * could be serious consequences (e.g. an uncaught exception within an error event handler, due
 * to the provider trying to log the error, can terminate the application). An exception could
 * result from faulty logic in the logger implementation, or it could be that this is not a logger
 * at all but some other kind of object; the former is handled by a catch block that logs an error
 * message to the provider's default logger, and we can at least partly guard against the latter by
 * checking for the presence of required methods at configuration time.
 */
export default class SafeLogger implements LDLogger {
  private logger: LDLogger;

  private fallback: LDLogger;

  /**
   * Construct a safe logger with the specified logger.
   * @param logger The logger to use.
   * @param fallback A fallback logger to use in case an issue is  encountered using
   * the provided logger.
   */
  constructor(logger: LDLogger, fallback: LDLogger) {
    LEVELS.forEach((level) => {
      if (!logger[level] || typeof logger[level] !== 'function') {
        throw new Error(`Provided logger instance must support logger.${level}(...) method`);
        // Note that the provider normally does not throw exceptions to the application, but that
        // rule does not apply to the constructor which will throw an exception if the parameters
        // are so invalid that we cannot proceed with creating the client. An invalid logger meets
        // those criteria since the SDK calls the logger during nearly all of its operations.
      }
    });
    this.logger = logger;
    this.fallback = fallback;
  }

  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string) {
    try {
      this.logger[level](message);
    } catch {
      // If all else fails do not break.
      this.fallback[level](message);
    }
  }

  error(message: string): void {
    this.log('error', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  info(message: string): void {
    this.log('info', message);
  }

  debug(message: string): void {
    this.log('debug', message);
  }
}
