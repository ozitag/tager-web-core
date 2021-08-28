import { redirect } from './redirect';
import { ServerResponse } from 'http';

interface FakeServerResponseModel {
  finished: boolean;
  headersSent: boolean;
  setHeader(name: string, value: string): void;
  statusCode: number;
  end(): void;
}

function getFakeServerResponse(): FakeServerResponseModel {
  return {
    finished: false,
    headersSent: false,
    setHeader(name: string, value: string) {},
    statusCode: 0,
    end() {},
  };
}

it('', () => {
  const fakeRes = getFakeServerResponse();
  redirect({
    currentUrl: '/users/1',
    location: '/login',
    res: fakeRes as ServerResponse,
    withQuery: true,
  });

  expect(fakeRes.end).toHaveBeenCalled();
});
