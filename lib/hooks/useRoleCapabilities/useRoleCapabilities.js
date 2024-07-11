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
 * Get capabilities for a given role.
 * 
 * @param {string} roleId The Role ID.
 * @param {string} tenant The Tenant ID. Defaults to `stripes.okapi.tenant`.
 * @param {boolean} expand Defines if capability sets must be expanded in the API response. Defaults to `false`.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @returns Capabilities.
 */
export const useRoleCapabilities = (roleId, tenant, expand = false, options = {}) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capabilities-list' });

  const { data, isSuccess } = useQuery({
    queryKey: [namespace, roleId, expand, tenant],
    queryFn: () => ky.get(
      `roles/${roleId}/capabilities`,
      {
        searchParams: {
          limit: CAPABILITIES_LIMIT,
          query: 'cql.allRecords=1 sortby resource',
          expand: !!expand,
        },
      },
    ).json(),
    enabled: Boolean(enabled && !!roleId),
    placeholderData: {
      capabilities: [], totalRecords: 0,
    },
    ...otherOptions,
  });

  const initialRoleCapabilitiesSelectedMap = useMemo(() => {
    return data?.capabilities.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {}) || {};
  }, [data]);

  const groupedRoleCapabilitiesByType = useMemo(() => {
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
    initialRoleCapabilitiesSelectedMap,
    isSuccess,
    capabilitiesTotalCount: data?.totalRecords || 0,
    groupedRoleCapabilitiesByType,
    capabilitiesAppIds
  };
};
