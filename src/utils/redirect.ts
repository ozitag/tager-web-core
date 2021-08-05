import { ServerResponse } from 'http';
import Router from 'next/router';

import { getSearchParamsFromUrl } from './searchParams';
import { isResSent } from './common';

/**
 * Source: https://github.com/zeit/next.js/issues/649#issuecomment-426552156
 * Alternative: https://github.com/zeit/next.js/wiki/Redirecting-in-%60getInitialProps%60
 */
export function redirect(params: {
  currentUrl: string;
  location: string;
  res?: ServerResponse;
  withQuery?: boolean;
}): void {
  const destinationLocation = params.withQuery
    ? [params.location, getSearchParamsFromUrl(params.currentUrl).toString()]
        .filter(Boolean)
        .join('?')
    : params.location;

  if (params.res && !isResSent(params.res)) {
    params.res.setHeader('Content-Type', 'text/html; charset=utf-8');
    params.res.setHeader('Location', destinationLocation);
    params.res.statusCode = 302;
    params.res.end();
  } else {
    Router.replace(destinationLocation);
  }
}
