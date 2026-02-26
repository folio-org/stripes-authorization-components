import { CONSORTIA_API } from '../../../constants';

export const getConsortiumTenants = (httpClient, consortiumId) => {
  return httpClient.get(`${CONSORTIA_API}/${consortiumId}/tenants`).json();
};
