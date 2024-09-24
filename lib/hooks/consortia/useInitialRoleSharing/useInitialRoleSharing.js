import { useCallback } from 'react';

import { useStripes } from '@folio/stripes/core';

import { getConsortiumCentralTenantId } from '../../../utils';
import { useRoleCapabilities } from '../../useRoleCapabilities';
import { useRoleCapabilitySets } from '../../useRoleCapabilitySets';
import { useRoleSharing } from '../useRoleSharing';

export const useInitialRoleSharing = (role) => {
  const stripes = useStripes();
  const centralTenantId = getConsortiumCentralTenantId(stripes);

  const { initialRoleCapabilitySetsNames } = useRoleCapabilitySets(role?.id, centralTenantId);
  const { initialRoleCapabilitiesNames } = useRoleCapabilities(role?.id, centralTenantId, true);

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
