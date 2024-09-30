import { useMutation } from 'react-query';
import { useOkapiKy, useStripes } from '@folio/stripes/core';

export const useUpdateUserRolesMutation = (handleError, options = {}) => {
  const { tenantId } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newRole) => {
      stripes.logger.log('authz-roles', `updating roles for ${newRole.userId}:: ${newRole.roleIds.join(', ')}`);
      return ky.put(`roles/users/${newRole.userId}`, { json: newRole }).json();
    },
    onError: handleError,
  });

  return { mutateUpdateUserRoles: mutateAsync, isLoading };
};
