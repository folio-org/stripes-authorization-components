import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

import { ROLES_API } from '../../constants';

export const useRoleById = (id, options = {}) => {
  const { enabled = true, tenantId, ...otherOptions } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: 'role-data' });

  const {
    data,
    isSuccess,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [namespace, id, tenantId],
    queryFn: ({ signal }) => ky.get(`${ROLES_API}/${id}`, { signal }).json(),
    enabled: enabled && !!id,
    ...otherOptions,
  });

  return {
    roleDetails: data,
    isSuccess,
    isLoading,
    refetch,
  };
};
