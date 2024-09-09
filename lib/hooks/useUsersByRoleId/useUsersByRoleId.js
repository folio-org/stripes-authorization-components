import { useQuery } from 'react-query';

import {
  useChunkedCQLFetch,
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { USERS_BY_ROLE_ID_QUERY_KEY } from '../constants';

/**
 * chunkedUsersReducer
 * reducer for useChunkedCQLFetch. Given input
 *   [
 *     { data: { users: [1, 2, 3] } },
 *     { data: { users: [4, 5, 6] } },
 *   ]
 * return
 *   [1, 2, 3, 4, 5, 6]
 *
 * @param {Array} list of chunks, each item shaped like { data: { users: [] }}
 * @returns Array flattened array of user data
 */
export const chunkedUsersReducer = (list) => (
  list.reduce((acc, cur) => {
    return [...acc, ...(cur?.data?.users ?? [])];
  }, []));

/**
 * useUsersByRoleId
 * Given a role ID, retrieve assigned users. Ugh, client-side join, 🤢.
 * @param {string} id role ID
 * @returns [ { id, personal: { firstName, lastName } }, ... ] Array of user objects
 */
export function useUsersByRoleId(id, options = {}) {
  const { enabled = true, tenantId, ...otherOptions } = options;

  const stripes = useStripes();
  const ky = useOkapiKy({ tenant: tenantId });
  const [namespace] = useNamespace({ key: USERS_BY_ROLE_ID_QUERY_KEY });

  // retrieve users assigned to the role to get their IDs...
  const { data, isSuccess, refetch } = useQuery({
    queryKey: [namespace, id, tenantId],
    queryFn: ({ signal }) => ky.get(`roles/users?limit=${stripes.config.maxUnpagedResourceCount}&query=roleId==${id}`, { signal }).json(),
    enabled: enabled && !!id,
    ...otherOptions
  });

  // ... then retrieve corresponding user objects via chunked fetch
  // since the list may be long.
  const ids = isSuccess ? data.userRoles.map(i => i.userId) : [];
  const {
    isLoading,
    items: users
  } = useChunkedCQLFetch({
    endpoint: 'users',
    ids,
    queryEnabled: isSuccess,
    reduceFunction: chunkedUsersReducer,
    tenantId,
  });

  return {
    users,
    isLoading,
    refetch
  };
}
