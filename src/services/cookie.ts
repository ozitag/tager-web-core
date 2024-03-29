import { IncomingMessage, ServerResponse } from 'http';
import Cookies from 'js-cookie';

import { Nullable } from '../typings/common';
import { isBrowser, isResSent } from '../utils/common';

function getCookie(field: string, req?: IncomingMessage): Nullable<string> {
  if (isBrowser()) {
    return Cookies.get(field) ?? null;
  }

  if (req) {
    const cookie = require('cookie');
    const cookieMap: { [key: string]: string } = cookie.parse(
      req.headers.cookie ?? ''
    );
    return cookieMap[field] ?? null;
  }

  return null;
}

function getSetCookieHeaders(res: ServerResponse): Array<string> {
  const headerValue = res.getHeader('Set-Cookie') ?? [];
  const headerArray = Array.isArray(headerValue) ? headerValue : [headerValue];

  return headerArray.map(String);
}

function updateCookie(
  field: string,
  value: string,
  res?: ServerResponse,
  expiresInDays?: number,
  domain?: string
): void {
  const options = {
    path: '/',
    expires: expiresInDays,
    domain
  };

  if (isBrowser()) {
    Cookies.set(field, value, options);
  } else {
    if (res && !isResSent(res)) {
      const cookie = require('cookie');
      const newCookie = cookie.serialize(field, value, options);
      res.setHeader('Set-Cookie', [...getSetCookieHeaders(res), newCookie]);
    } else {
      if (!res) {
        console.error('Cannot update cookie, because response is empty');
      } else if (isResSent(res)) {
        console.warn('Cannot update cookie, because response headers are sent');
      }
    }
  }
}

function removeCookie(field: string, res?: ServerResponse, domain?: string): void {
  if (isBrowser()) {
    Cookies.remove(field, {
      domain
    });
  } else {
    if (res && !isResSent(res)) {
      const cookie = require('cookie');

      const newCookie = cookie.serialize(field, '', domain ? {
        expires: new Date(0),
        domain
      } : { expires: new Date(0) });
      res.setHeader('Set-Cookie', [...getSetCookieHeaders(res), newCookie]);
    } else {
      if (!res) {
        console.error('Cannot remove cookie, because response is empty');
      } else if (isResSent(res)) {
        console.warn('Cannot remove cookie, because response headers are sent');
      }
    }
  }
}

const cookie = {
  get: getCookie,
  set: updateCookie,
  remove: removeCookie
} as const;

export default cookie;
