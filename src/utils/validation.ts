import { ValidationError } from '../typings/api';
import RequestError from '../services/RequestError';

import { isNonNullObjectGuard } from './common';

/**
 * Reference - The regex used in input with type="email" from W3C HTML Living Standard:
 * https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type=email)
 */
export const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const validators = {
  required(value: string) {
    return !value.trim();
  },
  email(value: string) {
    return !EMAIL_REGEXP.test(value);
  },
};

export function isValidationError(value: any): value is ValidationError {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.code === 'string' &&
      typeof value.message === 'string'
  );
}

export function convertRequestErrorToMap(error: Error): Record<string, string> {
  if (error instanceof RequestError) {
    const responseBody = error.body;

    if (
      isNonNullObjectGuard(responseBody) &&
      'errors' in responseBody &&
      isNonNullObjectGuard(responseBody.errors)
    ) {
      const { errors } = responseBody as { errors: Record<string, any> };

      return Object.keys(errors)
        .filter((key) => isValidationError(errors[key]))
        .reduce<Record<string, string>>((result, key) => {
          if (responseBody.errors) {
            result[key] = (responseBody.errors[key] as ValidationError).message;
          }
          return result;
        }, {});
    }
  }

  return {};
}
