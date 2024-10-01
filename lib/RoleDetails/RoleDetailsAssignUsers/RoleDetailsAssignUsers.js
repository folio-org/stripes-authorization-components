import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  useStripes,
  Pluggable,
} from '@folio/stripes/core';

export const RoleDetailsAssignUsers = ({
  tenantId,
  onSubmitSelectedUsers,
  initialSelectedUsers,
}) => {
  const stripes = useStripes();

  return (
    <Pluggable
      aria-haspopup="true"
      dataKey="assignUsers"
      id="clickable-plugin-assign-users"
      searchButtonStyle="default"
      searchLabel={<FormattedMessage id="stripes-authorization-components.assignUnassign" />}
      stripes={stripes}
      type="find-user"
      selectUsers={onSubmitSelectedUsers}
      initialSelectedUsers={initialSelectedUsers}
      tenantId={tenantId}
    >
      <FormattedMessage id="ui-users.permissions.assignUsers.actions.assign.notAvailable" />
    </Pluggable>
  );
};

RoleDetailsAssignUsers.propTypes = {
  initialSelectedUsers: PropTypes.object,
  tenantId: PropTypes.string,
  onSubmitSelectedUsers: PropTypes.func,
};
