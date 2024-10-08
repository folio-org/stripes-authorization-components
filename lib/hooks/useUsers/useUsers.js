import keyBy from 'lodash/keyBy';

import {
  useChunkedCQLFetch,
  useNamespace,
} from '@folio/stripes/core';

export const chunkedUsersReducer = (data) => {
  return data.flatMap(d => d.data?.users || []);
};

export const useUsers = (ids) => {
  const [namespace] = useNamespace({ key: 'users' });

  const { items, isLoading } = useChunkedCQLFetch({
    endpoint: 'users',
    ids: Array.from(new Set(ids.filter(Boolean))), // remove empty values
    reduceFunction: chunkedUsersReducer,
    generateQueryKey: ({ chunkedItem, endpoint }) => {
      return [namespace, endpoint, chunkedItem];
    },
  });

  return {
    users: keyBy(items, 'id'),
    isLoading
  };
};
