import { useMutation, useQueryClient } from 'react-query';
import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { ROLES_REQUEST_TIMEOUT } from '../../constants';

export const useDeleteRoleMutation = (callback, handleError, options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({
    tenant: tenantId,
    timeout: ROLES_REQUEST_TIMEOUT,
  });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (id) => ky.delete(`roles/${id}`).json(),
    onSuccess: async () => {
      await queryClient.invalidateQueries([namespace]);
      callback();
    },
    onError: handleError,
  });

  return { mutateAsync, isLoading };
};
