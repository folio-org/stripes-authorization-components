import {
  pick,
  mapValues,
  keyBy,
} from 'lodash';
import { useMemo } from 'react';
import { useQuery } from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { CAPABILITIES_LIMIT } from '../../constants';
import { getCapabilitiesGroupedByTypeAndResource } from '../../utils';

/**
 * Get capability sets for a given user.
 *
 * @param {string} userId The User ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @returns Capability Sets.
 */
export const useUserCapabilitiesSets = (userId, tenant, options = {}) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capability-sets' });

  const { data, isSuccess } = useQuery({
    queryKey: [namespace, userId],
    queryFn: () => {
      const searchParams = { limit: CAPABILITIES_LIMIT };
      return ky.get(`users/${userId}/capability-sets`, { searchParams }).json();
    },
    enabled: Boolean(enabled && !!userId),
    ...otherOptions,
  });

  const initialUserCapabilitySetsSelectedMap = useMemo(() => {
    return data?.capabilitySets?.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {}) || {};
  }, [data]);

  const groupedUserCapabilitySetsByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(data?.capabilitySets || []);
  }, [data]);

  const capabilitySetsCapabilities = useMemo(() => {
    return data?.capabilitySets?.flatMap(capSet => capSet.capabilities)
      .reduce((obj, item) => {
        obj[item] = true;

        return obj;
      }, {});
  }, [data]);

  const capabilitySetsAppIds = useMemo(() => {
    const capabilitySetsById = mapValues(keyBy(data?.capabilitySets, 'applicationId'), () => true) || {};
    const filteredByInstalledApplications = pick(capabilitySetsById, installedApplications);

    return filteredByInstalledApplications;
    // stripes.discovery is configured during application initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    initialUserCapabilitySetsSelectedMap,
    isSuccess,
    capabilitySetsTotalCount: data?.totalRecords || 0,
    groupedUserCapabilitySetsByType,
    capabilitySetsCapabilities,
    capabilitySetsAppIds,
  };
};
