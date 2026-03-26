import { useIntl } from 'react-intl';
import { useMutation } from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';
import { escapeCqlWildcards } from '@folio/stripes/util';

import { ROLE_TYPE } from '../../../constants';
import {
  getConsortium,
  getConsortiumCentralTenantId,
  getConsortiumTenants,
  RoleMutationClientError,
} from '../../../utils';
import { usePublishCoordinator } from '../usePublishCoordinator';

export const useSharedRoleValidator = () => {
  const stripes = useStripes();
  const intl = useIntl();
  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const ky = useOkapiKy({ tenant: centralTenantId });

  const { initPublicationRequest } = usePublishCoordinator();

  const { mutateAsync } = useMutation({
    mutationFn: async ({ role }) => {
      // Check if the role with the same name already exists in other tenants
      // If it does, we should not share the role and show an error message to the user
      const { tenants } = await getConsortiumTenants(ky, getConsortium(stripes)?.id);
      const tenantsMap = new Map(tenants.map((tenant) => [tenant.id, tenant]));

      const filtersMap = new Map([
        ['name', [escapeCqlWildcards(role.name), '==']],
        ['type', [ROLE_TYPE.consortium, '<>']],
      ]);
      const query = Array.from(filtersMap.entries())
        .map(([filter, [value, operator]]) => `${filter}${operator}"${value}"`)
        .join(' AND ');

      const {
        publicationErrors,
        publicationResults,
      } = await initPublicationRequest({
        url: `/roles?query=${query}`,
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

        throw new RoleMutationClientError(message);
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

        throw new RoleMutationClientError(message);
      }
    },
  });

  return {
    validate: mutateAsync,
  };
};
