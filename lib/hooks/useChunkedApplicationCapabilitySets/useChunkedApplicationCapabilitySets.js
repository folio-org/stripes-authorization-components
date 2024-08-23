import { isEmpty } from 'lodash';

import { useChunkedCQLFetch } from '@folio/stripes/core';

import {
  APPLICATIONS_STEP_SIZE,
  CAPABILITIES_LIMIT,
} from '../../constants';

// When fetching from a potentially large list of applications derived from appIds list
// make sure to chunk the request to avoid hitting limits.

export const useChunkedApplicationCapabilitySets = (appIds, options = {}) => {
  const { tenantId } = options;

  const { items, isLoading, queryKeys = [] } = useChunkedCQLFetch({
    endpoint: 'capability-sets',
    ids: appIds,
    limit: CAPABILITIES_LIMIT,
    idName: 'applicationId',
    queryOptions:{
      enabled: !isEmpty(appIds)
    },
    reduceFunction: data => data.flatMap(d => d.data?.capabilitySets || []),
    STEP_SIZE: APPLICATIONS_STEP_SIZE,
    tenantId,
  });

  return { items, isLoading, queryKeys };
};
