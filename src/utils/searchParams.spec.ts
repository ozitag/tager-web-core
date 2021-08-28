import { parseAbsoluteUrl } from './searchParams';

it('should parse valid absolute url', () => {
  const url = parseAbsoluteUrl('https://google.com/search?q=query');
  expect(url).toBeInstanceOf(URL);
});

it('should return null if url is invalid', () => {
  const url = parseAbsoluteUrl('google.com/search?q=query');
  expect(url).toBe(null);
});

it('should return null if url is relative', () => {
  const url = parseAbsoluteUrl('/users/1');
  expect(url).toBe(null);
});
