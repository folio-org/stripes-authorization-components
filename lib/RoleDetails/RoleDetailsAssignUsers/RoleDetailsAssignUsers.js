import { keyBy } from 'lodash';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { FormattedMessage } from 'react-intl';

import {
  useStripes,
  Pluggable,
  useOkapiKy,
} from '@folio/stripes/core';

import {
  useAssignRolesToUserMutation,
  useDeleteUserRolesMutation,
  useErrorCallout,
  useUpdateUserRolesMutation,
} from '../../hooks';
import { apiVerbs, getNonKeycloakUsers, createUserRolesRequests } from '../utils';
import { USERS_BY_ROLE_ID_QUERY_KEY } from '../../hooks/constants';

export const RoleDetailsAssignUsers = ({
  selectedUsers,
  roleId,
  refetch,
  tenantId,
  setIsAuthUsersKeycloakConfirmationOpen,
  setNonKeycloakUsersList,
  setCheckingUsersInKeycloak
}) => {
  const stripes = useStripes();
  const okapiKy = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();
  const { sendErrorCallout } = useErrorCallout();

  const { mutateUpdateUserRoles } = useUpdateUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAssignRolesToUser } = useAssignRolesToUserMutation(sendErrorCallout, { tenantId });
  const { mutateDeleteUserRoles } = useDeleteUserRolesMutation(sendErrorCallout, { tenantId });
  const initialSelectedUsers = useMemo(() => keyBy(selectedUsers, 'id'), [selectedUsers]);

  const handleCheckKeycloakUsers = async (newSelectedUsers) => {
    const userIdsSet = new Set([...newSelectedUsers.map(x => x.id), ...Object.values(initialSelectedUsers).map(x => x.id)]);
    const nonKeycloakUsersList = await getNonKeycloakUsers({
      roleId,
      userIds: Array.from(userIdsSet),
      queryClient,
      ky: okapiKy
    });

    if (!nonKeycloakUsersList.length) {
      setIsAuthUsersKeycloakConfirmationOpen(false);
    }
    setNonKeycloakUsersList(nonKeycloakUsersList);
    setCheckingUsersInKeycloak(false);
  };

  /**
   * assignUsers
   * Callback from the plugin receives an updated list of selected users.
   * Since we only have 1/2 an API and cannot manipulate a role's users,
   * we instead have to manipulate each user's roles.
   *
   * @param {*} newSelectedUsers
   */
  const assignUsers = async (newSelectedUsers) => {
    setIsAuthUsersKeycloakConfirmationOpen(true);
    setCheckingUsersInKeycloak(true);

    const requests = await createUserRolesRequests(Object.values(initialSelectedUsers), newSelectedUsers, roleId, queryClient, okapiKy);
    const promises = [];

    for (const request of requests) {
      const { apiVerb, userId, roleIds } = request;
      switch (apiVerb) {
        case apiVerbs.PUT:
          promises.push(mutateUpdateUserRoles({ userId, roleIds }));
          break;
        case apiVerbs.POST:
          promises.push(mutateAssignRolesToUser({ userId, roleIds }));
          break;
        case apiVerbs.DELETE:
          promises.push(mutateDeleteUserRoles({ userId }));
          break;
        default:
          break;
      }
    }

    if (promises.length) {
      await Promise.allSettled(promises);
      // Refresh user list
      await queryClient.invalidateQueries(USERS_BY_ROLE_ID_QUERY_KEY);
    }

    await handleCheckKeycloakUsers(newSelectedUsers);
    await refetch();
  };

  return (
    <Pluggable
      aria-haspopup="true"
      dataKey="assignUsers"
      id="clickable-plugin-assign-users"
      searchButtonStyle="default"
      searchLabel={<FormattedMessage id="stripes-authorization-components.assignUnassign" />}
      stripes={stripes}
      type="find-user"
      selectUsers={assignUsers}
      initialSelectedUsers={initialSelectedUsers}
      tenantId={tenantId}
    >
      <FormattedMessage id="ui-users.permissions.assignUsers.actions.assign.notAvailable" />
    </Pluggable>
  );
};

RoleDetailsAssignUsers.propTypes = {
  selectedUsers: PropTypes.arrayOf(PropTypes.object),
  roleId: PropTypes.string,
  refetch: PropTypes.func,
  tenantId: PropTypes.string,
  setIsAuthUsersKeycloakConfirmationOpen: PropTypes.func,
  setNonKeycloakUsersList: PropTypes.func,
  setCheckingUsersInKeycloak: PropTypes.func
};
