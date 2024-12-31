import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  useStripes,
  Pluggable,
  IfPermission,
} from '@folio/stripes/core';

export const RoleDetailsAssignUsers = ({
  tenantId,
  onSubmitSelectedUsers,
  initialSelectedUsers,
}) => {
  const stripes = useStripes();

  const tenantName = useMemo(() => {
    const foundTenant = stripes.user?.user?.tenants?.find(tenant => tenant.id === tenantId);

    return foundTenant?.name;
  }, [stripes.user?.user?.tenants, tenantId]);

  return (
    <>
      <IfPermission perm="ui-authorization-roles.users.settings.manage">
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
          modalTitle={tenantName && (
            <FormattedMessage
              id="stripes-authorization-components.assignUnassign.modal.label"
              values={{ tenant: tenantName }}
            />
          )}
        >
          <FormattedMessage id="ui-users.permissions.assignUsers.actions.assign.notAvailable" />
        </Pluggable>
      </IfPermission>
    </>
  );
};

RoleDetailsAssignUsers.propTypes = {
  initialSelectedUsers: PropTypes.object,
  tenantId: PropTypes.string,
  onSubmitSelectedUsers: PropTypes.func,
};
