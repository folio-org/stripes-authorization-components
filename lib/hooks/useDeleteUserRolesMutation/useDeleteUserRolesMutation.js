import { useMutation } from 'react-query';
import { useOkapiKy, useStripes } from '@folio/stripes/core';

export const useDeleteUserRolesMutation = (handleError, options = {}) => {
  const { tenantId } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newRole) => {
      stripes.logger.log('authz-roles', `removing roles for ${newRole.userId}`);
      return ky.delete(`roles/users/${newRole.userId}`).json();
    },
    onError: handleError,
  });

  return { mutateDeleteUserRoles: mutateAsync, isLoading };
};
