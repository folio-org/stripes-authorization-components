import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

export const useUserGroups = (options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const stripes = useStripes();
  const [namespace] = useNamespace({ key: 'capabilities-list' });

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [namespace, tenantId],
    queryFn: ({ signal }) => ky.get(`groups?limit=${stripes.config.maxUnpagedResourceCount}&query=cql.allRecords=1 sortby desc`, { signal }).json(),
  });

  return {
    userGroups: data?.usergroups,
    isLoading,
    isSuccess,
  };
};
