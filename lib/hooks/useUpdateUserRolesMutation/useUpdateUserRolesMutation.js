import { useMutation, useQueryClient } from 'react-query';
import { useNamespace, useOkapiKy, useStripes } from '@folio/stripes/core';

export const useUpdateUserRolesMutation = (handleError, options = {}) => {
  const { tenantId } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (newRole) => {
      stripes.logger.log('authz-roles', `updating roles for ${newRole.userId}:: ${newRole.roleIds.join(', ')}`);
      return ky.put(`roles/users/${newRole.userId}`, { json: newRole }).json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(namespace);
    },
    onError: handleError,
  });

  return { mutateUpdateUserRoles: mutateAsync, isLoading };
};
