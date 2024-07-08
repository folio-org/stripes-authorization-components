import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

export const useRoleById = (id) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'role-data' });
  const { data, isSuccess } = useQuery({
    queryKey: [namespace, id],
    queryFn: ({ signal }) => ky.get(`roles/${id}`, { signal }).json(),
    enabled: !!id,
  });

  return { roleDetails:data, isSuccess };
};
