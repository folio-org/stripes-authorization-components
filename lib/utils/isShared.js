import { RECORD_SOURCE } from '../constants';

export const isShared = (record) => {
  return record?.source === RECORD_SOURCE.CONSORTIUM;
};
