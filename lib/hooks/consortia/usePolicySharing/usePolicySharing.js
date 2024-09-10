import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { CONSORTIA_API } from '../../../constants';
import {
  getConsortium,
  getConsortiumCentralTenantId,
} from '../../../utils';
import { usePublishCoordinator } from '../usePublishCoordinator';

export const usePolicySharing = (options = {}) => {
  const {
    onSuccess,
    ...mutationOptions
  } = options;

  // TODO: remove notes
  // path: consortia/{consortiumId}/sharing/policies

  const [namespace] = useNamespace();
  const queryClient = useQueryClient();
  const stripes = useStripes();
  const consortiumId = getConsortium(stripes)?.id;
  const centralTenantId = getConsortiumCentralTenantId(stripes);
  const ky = useOkapiKy({ tenant: centralTenantId });

  const { getPublicationResponse } = usePublishCoordinator();

  const {
    mutateAsync: upsertSharedPolicy,
    isLoading: isSharedPolicyUpserting,
  } = useMutation({
    mutationFn: async ({ policy }) => {
      if (!consortiumId || !centralTenantId) return Promise.reject();

      const json = {
        policyId: policy.id,
        // url: ???,
        payload: policy,
      };

      const res = await ky.post(`${CONSORTIA_API}/${consortiumId}/sharing/policies`, { json }).json();

      console.log(res);

      return res;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(namespace);
      onSuccess?.();
    },
    ...mutationOptions,
  });

  const isLoading = isSharedPolicyUpserting;

  return {
    isLoading,
    upsertSharedPolicy,
  };
};
