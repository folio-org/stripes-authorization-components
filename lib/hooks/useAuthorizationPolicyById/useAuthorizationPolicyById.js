import { useQuery } from 'react-query';

import { useOkapiKy, useNamespace } from '@folio/stripes/core';

import { POLICIES_API } from '../../constants';

const DEFAULT_DATA = {};

export const useAuthorizationPolicyById = (id, options = {}) => {
  const { enabled = true, tenantId, ...otherOptions } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const [namespace] = useNamespace({ key: 'authorization-policy-by-id' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: [namespace, tenantId, id],
    queryFn: () => ky.get(`${POLICIES_API}/${id}`).json(),
    enabled: enabled && Boolean(id),
    ...otherOptions,
  });

  return {
    policy: data || DEFAULT_DATA,
    isLoading,
    refetch,
  };
};
