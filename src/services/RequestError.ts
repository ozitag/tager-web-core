import { isomorphicLog } from '../utils/common';

import { ParsedResponseBody } from '../typings/api';
import { RequestErrorType } from '../typings/common';

class RequestError extends Error {
  status: { code: number; text: string };
  body: ParsedResponseBody;

  constructor(
    status: { code: number; text: string },
    body: ParsedResponseBody
  ) {
    super(JSON.stringify({ status, body }, null, 2));

    this.status = status;
    this.body = body;

    isomorphicLog(this);
  }

  public asObject(): RequestErrorType {
    return {
      statusCode: this.status.code,
      errorMessage: this.body && typeof this.body === 'object' && 'message' in this.body ? this.body['message'] : this.status.text
    };
  }
}

export default RequestError;
