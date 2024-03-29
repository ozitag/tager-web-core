import * as t from 'typed-contracts';
import RequestError from '../services/RequestError';

/**
 * Reference - The regex used in input with type="email" from W3C HTML Living Standard:
 * https://html.spec.whatwg.org/multipage/input.html#e-mail-state-(type=email)
 */
export const EMAIL_REGEXP =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const validators = {
    required(value: string): boolean {
        return !value.trim();
    },
    email(value: string): boolean {
        return !EMAIL_REGEXP.test(value);
    },
};

const requestErrorBodyContract = t.object({
    errors: t.objectOf(
        t.object({
            code: t.string,
            message: t.string,
        })
    ),
});

const requestErrorBodySimpleContract = t.object({
    errors: t.objectOf(t.string)
});

export function convertRequestErrorToMap(error: Error): Record<string, string> {
    if (error instanceof RequestError) {
        if (!error.body) {
            return {};
        }

        const validationResult = requestErrorBodyContract(
            'RequestError.body',
            error.body
        );

        if (!(validationResult instanceof t.ValidationError)) {
            return Object.keys(validationResult.errors).reduce<Record<string, string>>((result, key) => {
                result[key] = validationResult.errors[key]?.message || '';
                return result;
            }, {});
        }

        const validationSimpleResult = requestErrorBodySimpleContract(
            'RequestError.body',
            error.body
        );

        if (!(validationSimpleResult instanceof t.ValidationError)) {
            return Object.keys(validationSimpleResult.errors).reduce<Record<string, string>>((result, key) => {
                result[key] = validationSimpleResult.errors[key] || '';
                return result;
            }, {});
        }

        return {};
    }

    return {};
}
