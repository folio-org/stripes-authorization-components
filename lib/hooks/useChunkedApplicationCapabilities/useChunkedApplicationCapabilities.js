import { isEmpty } from 'lodash';

import { useChunkedCQLFetch } from '@folio/stripes/core';

import {
  APPLICATIONS_STEP_SIZE,
  CAPABILITIES_LIMIT,
} from '../../constants';

// When fetching from a potentially large list of applications derived from appIds list
// make sure to chunk the request to avoid hitting limits.

export const useChunkedApplicationCapabilities = (appIds, options = {}) => {
  const { tenantId } = options;

  const { items, isLoading, queryKeys = [] } = useChunkedCQLFetch({
    endpoint: 'capabilities',
    ids: appIds,
    limit: CAPABILITIES_LIMIT,
    idName: 'applicationId',
    // Remove dummy capabilities from the results, if any, since they are not valid.
    reduceFunction: data => data.flatMap(d => d.data?.capabilities.filter((c) => c && !c.dummyCapability) || []),
    queryOptions:{
      enabled: !isEmpty(appIds)
    },
    STEP_SIZE: APPLICATIONS_STEP_SIZE,
    tenantId,
  });

  return { items, isLoading, queryKeys };
};
