import {
  useMutation,
} from 'react-query';

import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

export const useAssignRolesToUserMutation = (handleError, options = {}) => {
  const { tenantId } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newRole) => {
      stripes.logger.log('authz-roles', `creating role for ${newRole.userId}:: ${newRole.roleIds.join(', ')}`);
      return ky.post('roles/users', { json: newRole }).json();
    },
    onError: handleError,
  });

  return { mutateAssignRolesToUser: mutateAsync, isLoading };
};
