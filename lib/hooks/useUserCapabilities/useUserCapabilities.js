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
 * Get capabilities for a given user.
 *
 * @param {string} userId The user ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @param {string} roleId The Role ID
 * @param {boolean} expand Defines if capability sets must be expanded in the API response. Defaults to `false`.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @returns Capabilities.
 */
export const useUserCapabilities = (userId, tenant = '', roleId, expand = false, options = {}) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'user-capabilities-list' });

  const { data, isSuccess } = useQuery({
    queryKey: [namespace, userId, expand, tenant, roleId],
    queryFn: () => ky.get(
      `users/${userId}/capabilities`,
      {
        searchParams: {
          limit: CAPABILITIES_LIMIT,
          query: roleId ? `cql.allRecords=1 sortby resource and roleId=${roleId}` : 'cql.allRecords=1 sortby resource',
          expand: !!expand,
        },
      },
    ).json(),
    enabled: Boolean(enabled && !!userId),
    placeholderData: {
      capabilities: [], totalRecords: 0,
    },
    ...otherOptions,
  });

  const initialUserCapabilitiesSelectedMap = useMemo(() => {
    return data?.capabilities.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {}) || {};
  }, [data]);

  const groupedUserCapabilitiesByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(data?.capabilities || []);
  }, [data]);

  const capabilitiesAppIds = useMemo(() => {
    const capabilitiesById = mapValues(keyBy(data?.capabilities, 'applicationId'), () => true) || {};
    const filteredByInstalledApplications = pick(capabilitiesById, installedApplications);

    return filteredByInstalledApplications;
    // stripes.discovery is configured during application initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    initialUserCapabilitiesSelectedMap,
    isSuccess,
    capabilitiesTotalCount: data?.totalRecords || 0,
    groupedUserCapabilitiesByType,
    capabilitiesAppIds
  };
};
