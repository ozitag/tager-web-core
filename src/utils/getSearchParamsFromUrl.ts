import { getSearchFromUrl } from './searchParams';

export function getSearchParamsFromUrl(url: string): URLSearchParams {
  return new URLSearchParams(getSearchFromUrl(url));
}
