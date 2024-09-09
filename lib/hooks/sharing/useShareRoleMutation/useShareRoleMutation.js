import {
  useMutation,
  useQueryClient,
} from 'react-query';

import {
  useNamespace,
  useOkapiKy,
} from '@folio/stripes/core';

export const useShareRoleMutation = () => {
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: () => console.log('share'),
    // onSuccess: async () => {
    //   if (shouldUpdateCapabilities) {
    //     await ky.put(`roles/${id}/capabilities`, { json: { capabilityIds: roleCapabilitiesListIds } });
    //   }
    //   if (shouldUpdateCapabilitySets) {
    //     await ky.put(`roles/${id}/capability-sets`, { json: { capabilitySetIds: roleCapabilitySetsListIds } });
    //   }
    //   await queryClient.invalidateQueries(namespace);
    // },
    // onError: handleError,
  });

  return {
    mutateAsync,
  };
};
