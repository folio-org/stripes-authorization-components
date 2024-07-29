import {
  useEffect,
  useState,
} from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { ROLES_ENDPOINT } from '../../constants';

export const useAuthorizationRoles = (tenantId) => {
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace();
  const stripes = useStripes();
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState([]);

  const handleSubmitSearch = searchValue => setSearchTerm(searchValue);

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [namespace, tenantId],
    queryFn: ({ signal }) => ky.get(ROLES_ENDPOINT(stripes.config.maxUnpagedResourceCount), { signal }).json()
  });

  useEffect(() => {
    if (isSuccess && data?.roles) {
      setRoles(data.roles);
    }
  }, [data, isSuccess]);

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return {
    roles: filteredRoles,
    isLoading,
    onSubmitSearch: handleSubmitSearch,
  };
};
