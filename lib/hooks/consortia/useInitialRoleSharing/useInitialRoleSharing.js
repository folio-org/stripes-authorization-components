import { useRoleSharing } from '../useRoleSharing';

export const useInitialRoleSharing = (role, options = {}) => {
  const { onSuccess, ...rest } = options;

  const { createSharedRole: shareRole } = useRoleSharing();

  return {
    shareRole,
  };
};
