import * as Promise from 'bluebird';
import * as retry from 'retry';
import * as errcode from 'err-code';

// Adapted from https://github.com/IndigoUnited/node-promise-retry, mostly to
// use Bluebird as the Promise library

const RetryCode = 'EPROMISERETRY';

function isRetry(err): boolean {
  return err && err.code === RetryCode && Object.prototype.hasOwnProperty.call(err, 'retried');
}

type RetryablePromise<T> = (error: any, attempts: number) => Promise<T>;

export function retryPromise<T>(promiseFn: RetryablePromise<T>, options?: retry.WrapOptions) {
  const operation = retry.operation(options);

  return new Promise<T>((resolve, reject) => {
    operation.attempt(attempts => {
      Promise.resolve()
        .then(() => {
          return promiseFn(err => {
            if (isRetry(err)) {
              err = err.retried;
            }

            throw errcode('Retrying', 'EPROMISERETRY', { retried: err });
          }, attempts);
        })
        .then(resolve, err => {
          if (isRetry(err)) {
            err = err.retried;
            if (operation.retry(err || new Error())) {
              return;
            }
          }

          reject(err);
        });
    });
  });
}
