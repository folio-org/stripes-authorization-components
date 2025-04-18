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

import {
  CAPABILITIES_LIMIT,
  ROLES_API,
} from '../../constants';
import { getCapabilitiesGroupedByTypeAndResource } from '../../utils';

/**
 * Get capabilities for a given role.
 *
 * @param {string} roleId The Role ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @param {boolean} expand Defines if capability sets must be expanded in the API response. Defaults to `false`.
 * with expand=false API returns capabilities that was assigned directly, not by capability set.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @returns Capabilities.
 */
export const useRoleCapabilities = (roleId, tenant = '', expand = false, options = {}) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capabilities-list' });

  const { data, isSuccess } = useQuery({
    queryKey: [namespace, roleId, expand, tenant],
    queryFn: () => ky.get(
      `${ROLES_API}/${roleId}/capabilities`,
      {
        searchParams: {
          limit: CAPABILITIES_LIMIT,
          query: 'cql.allRecords=1 sortby resource',
          expand: !!expand,
        },
      },
    ).json(),
    enabled: Boolean(enabled && !!roleId),
    ...otherOptions,
  });

  const initialRoleCapabilitiesSelectedMap = useMemo(() => {
    if (!data) return {};
    return data?.capabilities.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {}) || {};
  }, [data]);

  const groupedRoleCapabilitiesByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(data?.capabilities || []);
  }, [data]);

  const capabilitiesAppIds = useMemo(() => {
    if (!data) return {};
    const capabilitiesById = mapValues(keyBy(data?.capabilities, 'applicationId'), () => true) || {};

    return pick(capabilitiesById, installedApplications);
    // stripes.discovery is configured during application initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const initialRoleCapabilitiesNames = useMemo(() => {
    return data?.capabilities?.map(({ name }) => name);
  }, [data]);

  return {
    initialRoleCapabilitiesSelectedMap,
    initialRoleCapabilitiesNames,
    isSuccess,
    capabilitiesTotalCount: data?.totalRecords || 0,
    groupedRoleCapabilitiesByType,
    capabilitiesAppIds
  };
};
