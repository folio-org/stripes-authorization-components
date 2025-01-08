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
 * @param {string} roleId The Role ID.
 * @param {string} tenant The Tenant ID. Passes into `useOkapiKy` which will default to `stripes.okapi.tenant` if omitted.
 * @param {object} options Any additional options to pass into `useQuery()`.
 * @returns Capability Sets.
 */
export const useRoleCapabilitySets = (roleId, tenant = '', options = {}) => {
  const { enabled = true, ...otherOptions } = options;
  const stripes = useStripes();
  const installedApplications = Object.keys(stripes.discovery.applications);
  const ky = useOkapiKy({ tenant });
  const [namespace] = useNamespace({ key: 'role-capability-sets' });

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [namespace, roleId, tenant],
    queryFn: () => ky.get(`${ROLES_API}/${roleId}/capability-sets?limit=${CAPABILITIES_LIMIT}`).json(),
    enabled: Boolean(enabled && !!roleId),
    ...otherOptions,
  });

  const initialRoleCapabilitySetsSelectedMap = useMemo(() => {
    return data?.capabilitySets.reduce((acc, capability) => {
      acc[capability.id] = true;

      return acc;
    }, {}) || {};
  }, [data]);

  const groupedRoleCapabilitySetsByType = useMemo(() => {
    return getCapabilitiesGroupedByTypeAndResource(data?.capabilitySets || []);
  }, [data]);

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
    capabilitySetsTotalCount: data?.totalRecords || 0,
    groupedRoleCapabilitySetsByType,
    capabilitySetsCapabilities,
    capabilitySetsAppIds,
  };
};
