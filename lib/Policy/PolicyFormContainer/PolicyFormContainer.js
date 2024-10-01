import PropTypes from 'prop-types';
import {
  useHistory,
  useParams,
} from 'react-router-dom';

import { Loading } from '@folio/stripes/components';
import { useStripes } from '@folio/stripes/core';

import {
  useAuthorizationPolicyById,
  useAuthorizationPolicyMutation,
  usePolicySharing,
  useShowCallout,
} from '../../hooks';
import { isShared } from '../../utils';
import { PolicyForm } from '../PolicyForm';

export const PolicyFormContainer = ({
  path,
  tenantId,
  ...props
}) => {
  const stripes = useStripes();
  const history = useHistory();
  const showCallout = useShowCallout();
  const { id: policyId } = useParams();
  const actionType = policyId ? 'edit' : 'create';

  const { policy, isLoading } = useAuthorizationPolicyById(policyId, { tenantId });
  const { mutatePolicy, isLoading: isMutationLoading } = useAuthorizationPolicyMutation(null, { tenantId });
  const { upsertSharedPolicy, isLoading: isSharing } = usePolicySharing();

  const isPolicyShared = Boolean(stripes.hasInterface('consortia') && isShared(policy));

  const onClose = () => {
    history.push(path);
  };

  const handleSubmit = async (values) => {
    try {
      if (isPolicyShared) {
        await upsertSharedPolicy({ policy: values });
      } else {
        await mutatePolicy(values);
      }

      showCallout({
        messageId: `stripes-authorization-components.policy.${actionType}.success`
      });
      onClose();
    } catch {
      showCallout({
        messageId: `stripes-authorization-components.policy.${actionType}.error`,
        type: 'error',
      });
    }
  };

  const paneTitleId = `stripes-authorization-components.policy.${actionType}`;

  if (isLoading) return <Loading />;

  return (
    <PolicyForm
      {...props}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialValues={policy}
      paneTitleId={paneTitleId}
      isLoading={isMutationLoading || isSharing}
    />
  );
};

PolicyFormContainer.propTypes = {
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
