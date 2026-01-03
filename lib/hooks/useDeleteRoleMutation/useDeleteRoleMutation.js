import { useMutation, useQueryClient } from 'react-query';
import { useNamespace, useOkapiKy } from '@folio/stripes/core';

export const useDeleteRoleMutation = (callback, handleError, options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({
    tenant: tenantId,
    timeout: 60000, // To match default timeout in Kong
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
