export const getConsortiumCentralTenantId = (stripes) => {
  return stripes.user?.user?.consortium?.centralTenantId;
};
