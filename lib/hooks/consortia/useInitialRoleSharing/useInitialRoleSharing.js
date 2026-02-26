import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  getConsortium,
  getConsortiumCentralTenantId,
  getConsortiumTenants,
} from '../../../utils';
import { useRoleCapabilities } from '../../useRoleCapabilities';
import { useRoleCapabilitySets } from '../../useRoleCapabilitySets';
import { usePublishCoordinator } from '../usePublishCoordinator';
import { useRoleSharing } from '../useRoleSharing';

export const useInitialRoleSharing = (role, { tenantId }) => {
  const stripes = useStripes();
  const intl = useIntl();

  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const activeTenantId = stripes.okapi.tenant;
  const targetTenantId = tenantId || activeTenantId;
  const sharingEnabled = (
    centralTenantId === targetTenantId
    && stripes.hasPerm('consortia.sharing-roles-all.item.post')
  );

  const ky = useOkapiKy({ tenant: centralTenantId });
  const { initPublicationRequest } = usePublishCoordinator();

  const { initialRoleCapabilitySetsNames } = useRoleCapabilitySets(role?.id, centralTenantId, { enabled: sharingEnabled });
  const { initialRoleCapabilitiesNames } = useRoleCapabilities(role?.id, centralTenantId, false, { enabled: sharingEnabled });

  const { upsertSharedRole, isLoading } = useRoleSharing();

  const validateRoleBeforeSharing = useCallback(async () => {
    // Check if the role with the same name already exists in other tenants
    // If it does, we should not share the role and show an error message to the user
    const { tenants } = await getConsortiumTenants(ky, getConsortium(stripes)?.id);
    const tenantsMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));

    const {
      publicationErrors,
      publicationResults,
    } = await initPublicationRequest({
      url: `/roles?query=name=="${role.name}"`,
      method: 'GET',
      tenants: Array.from(tenantsMap.keys()).filter(id => id !== centralTenantId),
    });

    // If there are any errors related to publication, we should not share the role and show an error message to the user
    if (publicationErrors.length) {
      const message = intl.formatMessage(
        { id: 'stripes-authorization-components.role.share.error.validation' },
        {
          tenants: (
            publicationErrors
              .map(({ tenantId: id }) => tenantsMap.get(id).name)
              .sort((a, b) => a.localeCompare(b))
              .join(', ')
          )
        }
      );

      throw new Error(message);
    }

    const conflictingTenants = publicationResults
      .filter(({ response }) => response.totalRecords > 0)
      .map(({ tenantId: id }) => tenantsMap.get(id).name)
      .sort((a, b) => a.localeCompare(b));

    // If there are any tenants with conflicting role names, we should not share the role and show an error message to the user
    if (conflictingTenants.length) {
      const message = intl.formatMessage(
        { id: 'stripes-authorization-components.role.share.error.duplicate' },
        { tenants: conflictingTenants.join(', ') }
      );

      throw new Error(message);
    }
  }, [
    centralTenantId,
    initPublicationRequest,
    intl,
    ky,
    role?.name,
    stripes,
  ]);

  const mutationFn = useCallback(async () => {
    await validateRoleBeforeSharing();

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
