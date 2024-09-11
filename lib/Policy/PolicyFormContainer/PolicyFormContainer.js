import PropTypes from 'prop-types';
import {
  useHistory,
  useParams,
} from 'react-router-dom';

import { Loading } from '@folio/stripes/components';

import {
  useAuthorizationPolicyById,
  useAuthorizationPolicyMutation,
  useShowCallout,
} from '../../hooks';
import { PolicyForm } from '../PolicyForm';

export const PolicyFormContainer = ({ path, ...props }) => {
  const history = useHistory();
  const showCallout = useShowCallout();
  const { id: policyId } = useParams();
  const actionType = policyId ? 'edit' : 'create';

  const { policy, isLoading } = useAuthorizationPolicyById(policyId);
  const { mutatePolicy, isLoading: isMutationLoading } = useAuthorizationPolicyMutation();

  const onClose = () => {
    history.push(path);
  };

  const handleSubmit = (values) => {
    mutatePolicy(values)
      .then(() => {
        showCallout({
          messageId: `stripes-authorization-components.policy.${actionType}.success`
        });
        onClose();
      })
      .catch(() => {
        showCallout({
          messageId: `stripes-authorization-components.policy.${actionType}.error`,
          type: 'error',
        });
      });
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
      isLoading={isMutationLoading}
    />
  );
};

PolicyFormContainer.propTypes = {
  path: PropTypes.string.isRequired,
};
