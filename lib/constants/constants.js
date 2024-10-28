import {
  POLICIES_API,
  ROLES_API,
} from './api';

export const CAPABILITIES_LIMIT = 5000;
export const APPLICATIONS_STEP_SIZE = 5;
export const USER_ROLES_LIMIT = 2000;
export const USERS_BY_ROLE_ID_QUERY_KEY = 'user-role-data';

export const allRecords = 'cql.allRecords=1';
export const likeSearch = searchTerm => `*${searchTerm}*`;
export const ROLES_ENDPOINT = (limit) => `${ROLES_API}?limit=${limit}&query=${allRecords} sortby name`;

export const POLICIES_ENDPOINT = (searchTerm, limit = 1000) => {
  if (!searchTerm) {
    return `${POLICIES_API}?limit=${limit}&query=${allRecords} sortby name`;
  }
  return `${POLICIES_API}?limit=${limit}&query=name=${likeSearch(
    encodeURIComponent(searchTerm)
  )} sortby name`;
};

export const RECORD_SOURCE = {
  CONSORTIUM: 'consortium',
  FOLIO: 'folio',
  INN_REACH: 'inn-reach',
  LOCAL: 'local',
  MARC_RELATOR: 'marcrelator',
  RDA_CARRIER: 'rdacarrier',
  RDA_CONTENT: 'rdacontent',
  RDA_MODE_ISSUE: 'rdamodeissue',
  SYSTEM: 'system',
  UC: 'UC',
};

export const ROLE_TYPE = {
  default: 'DEFAULT',
  support: 'SUPPORT',
  regular: 'REGULAR',
  consortium: 'CONSORTIUM',
};

export const PUBLISH_COORDINATOR_STATUSES = {
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
  IN_PROGRESS: 'IN_PROGRESS',
};

export const ERROR_CODE_GENERIC = 'genericError';

export const MUTATION_ACTION_TYPE = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  share: 'share',
};
