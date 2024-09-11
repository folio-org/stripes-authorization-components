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
  POLICIES_API,
} from '../../../constants';
import {
  getConsortium,
  getConsortiumCentralTenantId,
} from '../../../utils';
import { PC_SHARING_DETAILS_KEYS } from '../../constants';
import { usePublishCoordinator } from '../usePublishCoordinator';

const getRequestId = (pcResponse) => {
  return pcResponse[PC_SHARING_DETAILS_KEYS.updatePoliciesPCId] || pcResponse[PC_SHARING_DETAILS_KEYS.createPoliciesPCId];
};

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

  const { getPublicationDetails } = usePublishCoordinator();

  const {
    mutateAsync: upsertSharedPolicy,
    isLoading: isSharedPolicyUpserting,
  } = useMutation({
    mutationFn: async ({ policy }) => {
      if (!consortiumId || !centralTenantId) return Promise.reject();

      const json = {
        policyId: policy.id,
        url: `/${POLICIES_API}`,
        payload: policy,
      };

      const response = await ky.post(`${CONSORTIA_API}/${consortiumId}/sharing/policies`, { json }).json();
      const pcDetails = await getPublicationDetails(getRequestId(response));

      console.log('pcDetails policy', pcDetails);

      return pcDetails;
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
