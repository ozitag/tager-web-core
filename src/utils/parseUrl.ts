export const FAKE_URL_BASE = 'https://fake-url-o.com';

export function parseUrl(url: string): URL | null {
  try {
    return new URL(url, FAKE_URL_BASE);
  } catch (error) {
    return null;
  }
}
