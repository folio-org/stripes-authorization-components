import { useMutation, useQueryClient } from 'react-query';
import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { ROLES_REQUEST_TIMEOUT } from '../../constants';

export const useEditRoleMutation = (
  { id, name, description },
  { roleCapabilitiesListIds, shouldUpdateCapabilities, shouldUpdateCapabilitySets, roleCapabilitySetsListIds },
  { handleError, tenantId }
) => {
  const ky = useOkapiKy({ tenant: tenantId, timeout: ROLES_REQUEST_TIMEOUT });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: () => ky.put(`roles/${id}`, { json: { name, description } }).json(),
    onSuccess: async () => {
      if (shouldUpdateCapabilities) {
        await ky.put(`roles/${id}/capabilities`, { json: { capabilityIds: roleCapabilitiesListIds } });
      }
      if (shouldUpdateCapabilitySets) {
        await ky.put(`roles/${id}/capability-sets`, { json: { capabilitySetIds: roleCapabilitySetsListIds } });
      }
      await queryClient.invalidateQueries(namespace);
    },
    onError: handleError,
  });
  return { mutateRole: mutateAsync, isLoading };
};
