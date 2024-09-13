import noop from 'lodash/noop';
import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { CAPABILITIES_LIMIT, ROLES_API } from '../../constants';

const DEFAULT_VALUE = [];

export const useAuthorizationRolesMutation = (options = {}) => {
  const { tenantId, onSuccess = noop, ...otherOptions } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: async (roleId) => {
      const capabilitiesSearchParams = {
        limit: CAPABILITIES_LIMIT,
        query: 'cql.allRecords=1 sortby resource',
        expand: true
      };
      // fetch current role and its capabilities, capabilitySets
      const {
        role = {},
        capabilitySets = DEFAULT_VALUE,
        capabilities = DEFAULT_VALUE
      } = await Promise.all([
        ky.get(`${ROLES_API}/${roleId}`).json(),
        ky.get(`${ROLES_API}/${roleId}/capability-sets?limit=${CAPABILITIES_LIMIT}`).json(),
        ky.get(`${ROLES_API}/${roleId}/capabilities`, { searchParams: capabilitiesSearchParams }).json()
      ]).then(([roleResponse, capabilitySetsResponse, capabilitiesResponse]) => {
        return ({
          role: roleResponse,
          capabilitySets: capabilitySetsResponse?.capabilitySets,
          capabilities: capabilitiesResponse?.capabilities
        });
      });

      // duplicate the role
      const duplicateRole = await ky
        .post(ROLES_API, {
          json: {
            ...role,
            id: undefined,
            name: `${role.name} - duplicate`,
            metadata: undefined,
          }
        }).json();

      // create new capabilitySets if any
      if (capabilitySets.length > 0) {
        await ky
          .post(`${ROLES_API}/capability-sets`, {
            json: {
              capabilitySetIds: capabilitySets.map(({ id }) => id),
              roleId: duplicateRole.id,
            }
          })
          .json();
      }

      // create new capabilities if any
      if (capabilities.length > 0) {
        await ky
          .post(`${ROLES_API}/capabilities`, {
            json: {
              capabilityIds: capabilities.map(({ id }) => id),
              roleId: duplicateRole.id,
            }
          })
          .json();
      }

      return duplicateRole;
    },
    onSuccess: async () => {
      onSuccess();
      await queryClient.invalidateQueries(namespace);
    },
    ...otherOptions,
  });

  return {
    duplicateAuthorizationRole: mutateAsync,
    isLoading
  };
};
