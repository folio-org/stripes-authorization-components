export const CAPABILITIES_LIMIT = 5000;
export const APPLICATIONS_STEP_SIZE = 5;

export const POLICIES_API = 'policies';
export const ROLES_API = 'roles';
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
