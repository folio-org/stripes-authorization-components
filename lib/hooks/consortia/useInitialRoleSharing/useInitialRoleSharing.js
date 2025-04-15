import { useCallback } from 'react';

import { useStripes } from '@folio/stripes/core';

import { getConsortiumCentralTenantId } from '../../../utils';
import { useRoleCapabilities } from '../../useRoleCapabilities';
import { useRoleCapabilitySets } from '../../useRoleCapabilitySets';
import { useRoleSharing } from '../useRoleSharing';

export const useInitialRoleSharing = (role, { tenantId }) => {
  const stripes = useStripes();

  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const sharingEnabled = (
    centralTenantId === targetTenantId
    && stripes.hasPerm('consortia.sharing-roles-all.item.post')
  );

  const { initialRoleCapabilitySetsNames } = useRoleCapabilitySets(role?.id, centralTenantId, { enabled: sharingEnabled });
  const { initialRoleCapabilitiesNames } = useRoleCapabilities(role?.id, centralTenantId, false, { enabled: sharingEnabled });

  const { upsertSharedRole, isLoading } = useRoleSharing();

  const shareRole = useCallback(() => {
    return upsertSharedRole({
      role,
      capabilityNames: initialRoleCapabilitiesNames,
      capabilitySetNames: initialRoleCapabilitySetsNames,
      shouldUpdateCapabilities: true,
      shouldUpdateCapabilitySets: true,
    });
  }, [initialRoleCapabilitiesNames, initialRoleCapabilitySetsNames, role, upsertSharedRole]);

  return {
    isLoading,
    shareRole,
  };
};
