import { useNamespace, useOkapiKy } from '@folio/stripes/core';
import { useQuery } from 'react-query';

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

export function useUserRolesById(userId, tenantId) {
  const [namespace] = useNamespace({ key: 'user-roles' });
  const ky = useOkapiKy({ tenant: tenantId });

  const queryFn = async () => {
    const response = await ky.get(`roles/users/${userId}`, {
      searchParams: {
        limit: 2000,
      },
    }).json();
    return response.userRoles ?? [];
  };

  const { data, isLoading } = useQuery(
    [namespace, 'roles/users', userId, tenantId],
    queryFn,
    {
      enabled: Boolean(tenantId && userId),
      keepPreviousData: true,
    }
  );

  return { userRolesResponse: data, isLoading };
}
