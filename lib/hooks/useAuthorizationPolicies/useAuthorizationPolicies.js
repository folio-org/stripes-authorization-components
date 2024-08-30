import { useQuery } from 'react-query';

import { useOkapiKy, useNamespace } from '@folio/stripes/core';

import { POLICIES_ENDPOINT } from '../../constants';

export const useAuthorizationPolicies = ({ searchTerm, options = {}, tenantId }) => {
  const { enabled = true, ...otherOptions } = options;

  const ky = useOkapiKy({ tenant: tenantId });

  const [namespace] = useNamespace({ key: 'ui-authorization-policies' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: [namespace, tenantId, searchTerm],
    queryFn: () => ky(POLICIES_ENDPOINT(searchTerm)).json(),
    enabled,
    ...otherOptions,
  });

  return {
    policies: data?.policies || [],
    isLoading,
    refetch,
  };
};
