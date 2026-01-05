import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

import { ROLES_REQUEST_TIMEOUT } from '../../constants';


export const useCreateRoleMutation = (roleCapabilitiesListIds, capabilitySetListIds, handleError, options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newRole) => ky.post('roles', { json: newRole }).json(),
    onSuccess: async (newRole) => {
      await queryClient.invalidateQueries(namespace);
      if (roleCapabilitiesListIds.length > 0) {
        await ky.post('roles/capabilities', { json: { roleId: newRole.id, capabilityIds: roleCapabilitiesListIds }, timeout: ROLES_REQUEST_TIMEOUT }).json();
      }
      if (capabilitySetListIds.length > 0) {
        await ky.post('roles/capability-sets', { json: { roleId: newRole.id, capabilitySetIds: capabilitySetListIds }, timeout: ROLES_REQUEST_TIMEOUT }).json();
      }
    },
    onError: handleError,
  });

  return { mutateRole: mutateAsync, isLoading };
};
