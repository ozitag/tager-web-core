import { dividePathnameAndSearch } from './searchParams';

export function getSearchFromUrl(url: string): string {
  const [, search] = dividePathnameAndSearch(url);
  return search;
}
