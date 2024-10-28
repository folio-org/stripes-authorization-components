import { useNamespace, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';
import { ROLES_BY_USER_ID_API, USER_ROLES_LIMIT } from '../../constants';

/* Get list of user-roles by user IDs. That is, a list of roles assigned to the requested user IDs.
// The response shape is:
{
  "userRoles": [
    {
        "userId": "<USER_ID>",
        "roleId": "<ROLE_ID>",
        "metadata": {
            "createdDate": "<UTC_DATETIME>",
            "createdBy": "<USER_ID>"
        }
    },
    ...
  ]
}
*/

export function useUserRolesById(userId, options = {}) {
  const [namespace] = useNamespace({ key: 'user-roles' });
  const { tenantId } = options;
  const ky = useOkapiKy({ tenant: tenantId });

  const queryFn = async () => {
    const response = await ky.get(`${ROLES_BY_USER_ID_API}/${userId}`, {
      searchParams: {
        limit: USER_ROLES_LIMIT,
      },
    }).json();
    return response.userRoles;
  };

  const { data, isLoading, isFetching } = useQuery(
    [namespace, 'roles/users', userId, tenantId],
    queryFn,
    {
      enabled: Boolean(tenantId && userId),
      keepPreviousData: true,
      ...options
    }
  );

  return { userRolesResponse: data || [], isLoading, isFetching };
}
