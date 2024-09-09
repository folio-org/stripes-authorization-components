import { useShareRoleMutation } from '../useShareRoleMutation';

export const useInitialRoleSharing = (role, options = {}) => {
  const { onSuccess, ...rest } = options;

  const { mutateAsync: shareRole } = useShareRoleMutation();

  return {
    shareRole,
  };
};
