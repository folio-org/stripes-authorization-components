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
 * Get capability sets for a given role.
 *
 *
 * @param {string} roleId The Role ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @param {Function} filter - client-side predicate (capabilitySet) => boolean, applied on top of the
 *   fetched capability sets before deriving `groupedRoleCapabilitySetsByType`.
 *   Defaults to `() => true` (no filtering). Deliberately NOT applied to
 *    `capabilitySetsCapabilities` or `capabilitySetsAppIds` -
 *    the disabled-capabilities bookkeeping and app-picker membership shouldn't
 *   change just because a set is filtered out (e.g. hidden) from the grid.
 * @returns {object}
 *   The return object consists of filtered fields and unfiltered fields.
 *    Filtered fields:
 *      These are directly used to render list of data, where client filtering
 *      will need to be active.
 *      - `groupedRoleCapabilitySetsByType`
 *      - `capabilitySetsTotalCount`
 *    Unfiltered fields:
 *      These are used to set state and persist, despite client filters.
 *      - `initialRoleCapabilitySetsSelectedMap`
 *      - `initialRoleCapabilitySetsNames`
 *      - `capabilitySetsCapabilities`
 *      - `capabilitySetsAppIds`
 *    Request metadata:
 *      - `isSuccess`
 *      - `isLoading`
 *      - `isFetching`
 */
export const useRoleCapabilitySets = (roleId, tenant = '', options = {}, filter = (_capabilitySet) => true) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capability-sets' });

  const { data, isSuccess, isLoading, isFetching } = useQuery({
    queryKey: [namespace, roleId, tenant],
    queryFn: () => ky.get(`${ROLES_API}/${roleId}/capability-sets?limit=${CAPABILITIES_LIMIT}`).json(),
    enabled: Boolean(enabled && !!roleId),
    ...otherOptions,
  });

  const filteredCapabilitySets = useMemo(() => {
    return (data?.capabilitySets || []).filter(filter);
  }, [data, filter]);

  const initialRoleCapabilitySetsSelectedMap = useMemo(() => {
    return data?.capabilitySets.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {});
  }, [data]);

  const groupedRoleCapabilitySetsByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(filteredCapabilitySets);
  }, [filteredCapabilitySets]);

  /* We need to determine how many times a specific capability is included in various capability sets
  to initialize the disabled capabilities
  */
  const capabilitySetsCapabilities = useMemo(() => {
    return data?.capabilitySets
      .flatMap(capSet => capSet.capabilities)
      .reduce((acc, item) => {
        acc[item] = true;
        return acc;
      }, {});
  }, [data]);

  const capabilitySetsAppIds = useMemo(() => {
    const capabilitySetsById = mapValues(keyBy(data?.capabilitySets, 'applicationId'), () => true) || {};

    return pick(capabilitySetsById, installedApplications);
    // stripes.discovery is configured during application initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const initialRoleCapabilitySetsNames = useMemo(() => {
    return data?.capabilitySets?.map(({ name }) => name);
  }, [data]);

  return {
    initialRoleCapabilitySetsSelectedMap,
    initialRoleCapabilitySetsNames,
    isSuccess,
    isLoading,
    isFetching,
    capabilitySetsTotalCount: filteredCapabilitySets?.length || 0,
    groupedRoleCapabilitySetsByType,
    capabilitySetsCapabilities,
    capabilitySetsAppIds,
  };
};
