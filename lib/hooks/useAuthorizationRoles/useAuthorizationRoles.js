import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { ROLES_ENDPOINT } from '../../constants';

const DEFAULT_DATA = { roles: [] };

export const useAuthorizationRoles = (tenantId, options = {}) => {
  const { enabled = true, ...otherOptions } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace();
  const stripes = useStripes();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmitSearch = useCallback(searchValue => setSearchTerm(searchValue), []);

  const { data = DEFAULT_DATA, isLoading } = useQuery({
    queryKey: [namespace, tenantId],
    queryFn: ({ signal }) => ky.get(ROLES_ENDPOINT(stripes.config.maxUnpagedResourceCount), { signal }).json(),
    enabled,
    ...otherOptions,
  });

  const filteredRoles = useMemo(() => {
    if (data.roles?.length) {
      return data.roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return [];
  }, [data.roles, searchTerm]);

  return {
    roles: filteredRoles,
    isLoading,
    onSubmitSearch: handleSubmitSearch,
  };
};
