import { useSharePolicyMutation } from '../useSharePolicyMutation';

export const useInitialPolicySharing = (policy, options = {}) => {
  const { onSuccess, ...rest } = options;

  const { mutateAsync: shareRole } = useSharePolicyMutation();

  return {
    shareRole,
  };
};
