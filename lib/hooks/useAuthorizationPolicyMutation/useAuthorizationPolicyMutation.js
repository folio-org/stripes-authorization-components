import { useMutation, useQueryClient } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { POLICIES_API } from '../../constants';

export const useAuthorizationPolicyMutation = (handleError, options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const [namespace] = useNamespace();

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (policy) => {
      const kyMethod = policy.id ? 'put' : 'post';
      const kyPath = policy.id ? `${POLICIES_API}/${policy.id}` : POLICIES_API;

      return ky[kyMethod](`${kyPath}`, { json: policy }).json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(namespace);
    },
    onError: handleError,
  });

  return {
    mutatePolicy: mutateAsync,
    isLoading,
  };
};
