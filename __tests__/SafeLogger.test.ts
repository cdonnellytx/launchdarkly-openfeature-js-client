import { basicLogger, LDLogger } from 'launchdarkly-js-client-sdk';
import SafeLogger from '../src/SafeLogger';

it('throws when constructed with an invalid logger', () => {
  expect(
    () => new SafeLogger({} as LDLogger, basicLogger({})),
  ).toThrow();
});

describe('given a logger that throws in logs', () => {
  const strings: string[] = [];
  const logger = new SafeLogger({
    info: () => { throw new Error('info'); },
    debug: () => { throw new Error('info'); },
    warn: () => { throw new Error('info'); },
    error: () => { throw new Error('info'); },
  }, basicLogger({
    level: 'debug',
    destination: (...args: any) => {
      strings.push(args.join(' '));
    },
  }));

  it('uses the fallback logger', () => {
    logger.debug('a');
    logger.info('b');
    logger.warn('c');
    logger.error('d');
    expect(strings).toEqual([
      'debug: [LaunchDarkly] a',
      'info: [LaunchDarkly] b',
      'warn: [LaunchDarkly] c',
      'error: [LaunchDarkly] d',
    ]);
  });
});
