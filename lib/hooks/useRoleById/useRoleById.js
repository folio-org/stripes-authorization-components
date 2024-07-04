import { useQuery } from 'react-query';

import { useNamespace, useOkapiKy } from '@folio/stripes/core';

export const useRoleById = (id) => {
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: 'role-data' });
  const { data, isSuccess } = useQuery(
    [namespace, id],
    () => ky.get(`roles/${id}`).json(),
    { enabled: !!id }
  );

  return { roleDetails:data, isSuccess };
};
