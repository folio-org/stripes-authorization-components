import { useCallback } from 'react';
import { useMutation } from 'react-query';

import { useStripes } from '@folio/stripes/core';

import { getConsortiumCentralTenantId } from '../../../utils';
import { useRoleCapabilities } from '../../useRoleCapabilities';
import { useRoleCapabilitySets } from '../../useRoleCapabilitySets';
import { useRoleSharing } from '../useRoleSharing';
import { useSharedRoleValidator } from '../useSharedRoleValidator';

export const useInitialRoleSharing = (role, { tenantId }) => {
  const stripes = useStripes();

  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const activeTenantId = stripes.okapi.tenant;
  const targetTenantId = tenantId || activeTenantId;
  const sharingEnabled = (
    centralTenantId === targetTenantId
    && stripes.hasPerm('consortia.sharing-roles-all.item.post')
  );

  const { initialRoleCapabilitySetsNames } = useRoleCapabilitySets(role?.id, centralTenantId, { enabled: sharingEnabled });
  const { initialRoleCapabilitiesNames } = useRoleCapabilities(role?.id, centralTenantId, false, { enabled: sharingEnabled });

  const { upsertSharedRole, isLoading } = useRoleSharing();
  const { validate: validateRoleBeforeSharing } = useSharedRoleValidator();

  const mutationFn = useCallback(async () => {
    await validateRoleBeforeSharing({ role });

    return upsertSharedRole({
      role,
      capabilityNames: initialRoleCapabilitiesNames,
      capabilitySetNames: initialRoleCapabilitySetsNames,
      shouldUpdateCapabilities: true,
      shouldUpdateCapabilitySets: true,
    });
  }, [
    initialRoleCapabilitiesNames,
    initialRoleCapabilitySetsNames,
    role,
    upsertSharedRole,
    validateRoleBeforeSharing,
  ]);

  const mutation = useMutation({ mutationFn });

  return {
    isLoading: isLoading || mutation.isLoading,
    shareRole: mutation.mutateAsync,
  };
};
