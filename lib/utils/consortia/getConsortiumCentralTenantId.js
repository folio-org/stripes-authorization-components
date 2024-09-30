import { getConsortium } from './getConsortium';

export const getConsortiumCentralTenantId = (stripes) => {
  return getConsortium(stripes)?.centralTenantId;
};
