import { UrlObject } from 'url';
import {
  getRouteMatcher,
  getRouteRegex,
  isDynamicRoute,
} from 'next/dist/next-server/lib/router/utils';
import escapePathDelimiters from 'next/dist/next-server/lib/router/utils/escape-path-delimiters';

import { Nullish } from '../typings/common';

export type DynamicLink = { href: UrlObject; as: string };

type QueryParamValue = number | string | Array<string>;

type QueryParamValueString = string | Array<string>;

function convertQueryValuesToString(
  query: Record<string, QueryParamValue>
): Record<string, QueryParamValueString> {
  return Object.keys(query).reduce<Record<string, QueryParamValueString>>(
    (resultQuery, key) => {
      const value = query[key];

      resultQuery[key] = Array.isArray(value)
        ? value.map(String)
        : String(value);

      return resultQuery;
    },
    {}
  );
}

export type DynamicLinkBuilder<Key extends string> = Readonly<{
  match: (url: string) => ReturnType<ReturnType<typeof getRouteMatcher>>;
  build: (query: Record<Key, QueryParamValue>) => DynamicLink;
}>;

/**
 * Reference:
 * https://github.com/vercel/next.js/blob/v9.5.1/packages/next/client/page-loader.js#L138-L185
 */
export function createDynamicLinkBuilder<Key extends string>(
  route: string
): DynamicLinkBuilder<Key> {
  if (!isDynamicRoute(route)) {
    throw new Error(`Route "${route}" is not dynamic!`);
  }

  const routeRegex = getRouteRegex(route);
  const routeMatcher = getRouteMatcher(routeRegex);

  return {
    match: (url) => routeMatcher(url),
    build: (query) => {
      const convertedQuery = convertQueryValuesToString(query);

      let interpolatedRoute = route;

      Object.keys(routeRegex.groups).forEach((param) => {
        let value = convertedQuery[param];

        const { repeat, optional } = routeRegex.groups[param];

        let replaced = `[${repeat ? '...' : ''}${param}]`;
        if (optional) {
          replaced = `${!value ? '/' : ''}[${replaced}]`;
        }

        if (repeat && !Array.isArray(value)) {
          value = [value];
        }

        // Interpolate group into data URL if present
        interpolatedRoute =
          interpolatedRoute.replace(
            replaced,
            repeat
              ? (value as Array<string>).map(escapePathDelimiters).join('/')
              : escapePathDelimiters(value as string)
          ) || '/';
      });

      return {
        href: { pathname: route, query },
        as: interpolatedRoute,
      };
    },
  };
}

export function createLinkConverter(
  linkBuilderList: Array<DynamicLinkBuilder<any>>
) {
  return function convertPathToDynamicLink(
    path: Nullish<string>
  ): DynamicLink | string {
    if (!path) return '';

    for (let linkBuilder of linkBuilderList) {
      const match = linkBuilder.match(path);

      if (match) {
        return linkBuilder.build(match);
      }
    }

    return path;
  };
}
