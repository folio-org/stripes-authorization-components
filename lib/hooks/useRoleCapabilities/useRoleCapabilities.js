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
 * @param {Function} filter - client-side predicate (capability) => boolean, applied on top of the
 *   fetched capabilities before deriving `initialRoleCapabilitiesSelectedMap`, `groupedRoleCapabilitiesByType`,
 *   and `initialRoleCapabilitiesNames`. Defaults to `() => true` (no filtering). Deliberately NOT applied to
 *   `capabilitiesAppIds`, since app-picker membership shouldn't disappear just because all of an app's
 *   capabilities are filtered out (e.g. hidden).
 * @returns Capabilities.
 */
export const useRoleCapabilities = (roleId, tenant = '', expand = false, options = {}, filter = (_capability) => true) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capabilities-list' });

  const { data, isSuccess, isFetching } = useQuery({
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

  const filteredCapabilities = useMemo(() => {
    return (data?.capabilities || []).filter(filter);
  }, [data, filter]);

  const initialRoleCapabilitiesSelectedMap = useMemo(() => {
    return filteredCapabilities.reduce((acc, capability) => {
      acc[capability.id] = true;
      return acc;
    }, {}) || {};
  }, [data]);

  const groupedRoleCapabilitiesByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(filteredCapabilities);
  }, [filteredCapabilities]);

  const capabilitiesAppIds = useMemo(() => {
    if (!data) return {};
    const capabilitiesById = mapValues(keyBy(data?.capabilities, 'applicationId'), () => true) || {};

    return pick(capabilitiesById, installedApplications);
    // stripes.discovery is configured during application initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const initialRoleCapabilitiesNames = useMemo(() => {
    return filteredCapabilities.map(({ name }) => name);
  }, [filteredCapabilities]);

  return {
    initialRoleCapabilitiesSelectedMap,
    initialRoleCapabilitiesNames,
    isSuccess,
    isFetching,
    capabilitiesTotalCount: data?.totalRecords || 0,
    groupedRoleCapabilitiesByType,
    capabilitiesAppIds
  };
};
