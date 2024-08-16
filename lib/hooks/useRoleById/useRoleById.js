import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

export const useRoleById = (id, options = {}) => {
  const { tenantId } = options;

  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: 'role-data' });
  const { data, isSuccess } = useQuery({
    queryKey: [namespace, id, tenantId],
    queryFn: ({ signal }) => ky.get(`roles/${id}`, { signal }).json(),
    enabled: !!id,
  });

  return { roleDetails:data, isSuccess };
};
