import { ConstantMap, FetchStatus } from '../typings/common';

export const FETCH_STATUSES: ConstantMap<FetchStatus> = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};
