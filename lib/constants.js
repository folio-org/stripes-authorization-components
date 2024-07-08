export const CAPABILITIES_LIMIT = 5000;
export const APPLICATIONS_STEP_SIZE = 5;

export const allRecords = 'cql.allRecords=1';
export const likeSearch = searchTerm => `*${searchTerm}*`;
export const ROLES_ENDPOINT = (limit) => `roles?limit=${limit}&query=${allRecords} sortby name`;
