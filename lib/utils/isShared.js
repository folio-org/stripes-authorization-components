import { RECORD_SOURCE } from '../constants';

export const isShared = (record) => {
  return record?.source?.toLowerCase() === RECORD_SOURCE.CONSORTIUM || record?.type?.toLowerCase() === RECORD_SOURCE.CONSORTIUM;
};
