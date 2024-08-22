import { useChunkedCQLFetch, useNamespace, useStripes } from '@folio/stripes/core';

import {
  APPLICATIONS_STEP_SIZE,
  CAPABILITIES_LIMIT,
} from '../../constants';

// When fetching from a potentially large list of applications derived
// from stripes.discovery.applications
// make sure to chunk the request to avoid hitting limits.

export const useCapabilities = () => {
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const [namespace] = useNamespace({ key: 'capabilities-list' });

  const { items, isLoading, queryKeys = [] } = useChunkedCQLFetch({
    endpoint: 'capabilities',
    ids: installedApplications,
    limit: CAPABILITIES_LIMIT,
    idName: 'applicationId',
    reduceFunction: data => {
      return data.flatMap(d => d.data?.capabilities || []);
    },
    generateQueryKey: ({ chunkedItem, endpoint }) => {
      return [namespace, endpoint, chunkedItem];
    },
    STEP_SIZE: APPLICATIONS_STEP_SIZE
  });

  return {
    capabilitiesList: items,
    isLoading,
    queryKeys
  };
};
