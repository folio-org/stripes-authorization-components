import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import {
  CONSORTIA_API,
  ROLES_API,
} from '../../../constants';
import {
  getConsortium,
  getConsortiumCentralTenantId,
} from '../../../utils';
import { PC_SHARING_DETAILS_KEYS } from '../../constants';
import { usePublishCoordinator } from '../usePublishCoordinator';

const getPCRequestIds = (pcResponse) => {
  return pcResponse[PC_SHARING_DETAILS_KEYS.updateRolesPCIds] || pcResponse[PC_SHARING_DETAILS_KEYS.createRolesPCIds];
};

export const useRoleSharing = (options = {}) => {
  const {
    onSuccess,
    ...mutationOptions
  } = options;

  const [namespace] = useNamespace();
  const queryClient = useQueryClient();
  const stripes = useStripes();
  const consortiumId = getConsortium(stripes)?.id;
  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const ky = useOkapiKy({ tenant: centralTenantId });

  const { getPublicationDetails } = usePublishCoordinator();

  const baseApi = `${CONSORTIA_API}/${consortiumId}/sharing/roles`;

  const makePublisherRequests = (pcIds = [], signal) => {
    return Promise.all(pcIds.map(pcId => getPublicationDetails(pcId, { signal })));
  };

  const {
    mutateAsync: upsertSharedRoleCapabilities,
    isLoading: isSharedRoleCapabilitiesUpserting,
  } = useMutation({
    mutationFn: async ({ roleId, roleName, capabilityNames, signal }) => {
      const payload = {
        roleId,
        roleName,
        url: `/${ROLES_API}/capabilities`,
        payload: {
          roleId,
          capabilityNames,
        },
      };

      const response = await ky.post(`${baseApi}/capabilities`, { json: payload, signal }).json();
      const pcDetails = await makePublisherRequests(getPCRequestIds(response), signal);

      return pcDetails;
    },
  });

  const {
    mutateAsync: upsertSharedRoleCapabilitySets,
    isLoading: isSharedRoleCapabilitySetsUpserting,
  } = useMutation({
    mutationFn: async ({ roleId, roleName, capabilitySetNames, signal }) => {
      const payload = {
        roleId,
        roleName,
        url: `/${ROLES_API}/capability-sets`,
        payload: {
          roleId,
          capabilitySetNames,
        },
      };

      const response = await ky.post(`${baseApi}/capability-sets`, { json: payload, signal }).json();
      const pcDetails = await makePublisherRequests(getPCRequestIds(response), signal);

      return pcDetails;
    },
  });

  const {
    mutateAsync: upsertSharedRole,
    isLoading: isSharedRoleUpserting,
  } = useMutation({
    mutationFn: async (data) => {
      if (!consortiumId || !centralTenantId) return Promise.reject();

      const {
        role,
        capabilityNames,
        capabilitySetNames,
        shouldUpdateCapabilities,
        shouldUpdateCapabilitySets,
        signal,
      } = data;

      const { id: roleId, name: roleName } = role;
      const payload = {
        roleId,
        roleName,
        url: `/${ROLES_API}`,
        payload: role,
      };

      const response = await ky.post(baseApi, { json: payload, signal }).json();
      const pcDetails = await makePublisherRequests(getPCRequestIds(response), signal);

      if (shouldUpdateCapabilities) await upsertSharedRoleCapabilities({ roleId, roleName, capabilityNames, signal });
      if (shouldUpdateCapabilitySets) await upsertSharedRoleCapabilitySets({ roleId, roleName, capabilitySetNames, signal });

      return pcDetails;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(namespace);
      await onSuccess?.();
    },
    ...mutationOptions,
  });

  const {
    mutateAsync: deleteSharedRole,
    isLoading: isSharedRoleDeleting,
  } = useMutation({
    mutationFn: async (data) => {
      if (!consortiumId || !centralTenantId) return Promise.reject();

      const { role, signal } = data;

      const roleId = role.id;
      const payload = {
        roleId: role.id,
        roleName: role.name,
        url: `/${ROLES_API}`,
        payload: role,
      };

      const { pcIds } = await ky.delete(`${baseApi}/${roleId}`, { json: payload, signal }).json();
      const pcDetails = await makePublisherRequests(pcIds, signal);

      return pcDetails;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(namespace);
      await onSuccess?.();
    },
    ...mutationOptions,
  });

  const isLoading = (
    isSharedRoleUpserting
    || isSharedRoleCapabilitiesUpserting
    || isSharedRoleCapabilitySetsUpserting
    || isSharedRoleDeleting
  );

  return {
    isLoading,
    upsertSharedRole,
    deleteSharedRole,
  };
};
