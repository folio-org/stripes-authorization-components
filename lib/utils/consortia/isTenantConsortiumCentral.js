import { getConsortiumCentralTenantId } from './getConsortiumCentralTenantId';

export const isTenantConsortiumCentral = (stripes, tenantId) => {
  return tenantId === getConsortiumCentralTenantId(stripes);
};
