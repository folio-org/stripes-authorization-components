import { useMemo, useState } from 'react';
import keyBy from 'lodash/keyBy';
import PropTypes from 'prop-types';

import {
  Accordion,
  Badge,
  Loading,
  MultiColumnList,
  NoValue,
  TextLink,
  ConfirmationModal,
} from '@folio/stripes/components';

import { FormattedMessage, useIntl } from 'react-intl';

import { getFullName } from '@folio/stripes/util';

import { useQueryClient } from 'react-query';
import { useOkapiKy } from '@folio/stripes/core';
import {
  useErrorCallout,
  useUserGroups,
  useUsersByRoleId,
  useCreateAuthUserKeycloak,
  useUpdateUserRolesMutation, useAssignRolesToUserMutation, useDeleteUserRolesMutation
} from '../../hooks';
import { RoleDetailsAssignUsers } from '../RoleDetailsAssignUsers/RoleDetailsAssignUsers';
import { apiVerbs, createUserRolesRequests, getNonKeycloakUsers } from '../utils';
import { USERS_BY_ROLE_ID_QUERY_KEY } from '../../constants';

export const RoleDetailsUsersAccordion = ({ roleId, tenantId }) => {
  const { formatMessage } = useIntl();
  const [nonKeycloakUsersList, setNonKeycloakUsersList] = useState([]);
  const [isAuthUsersKeycloakConfirmationOpen, setIsAuthUsersKeycloakConfirmationOpen] = useState(false);
  const [checkingUsersInKeycloak, setCheckingUsersInKeycloak] = useState(false);
  const { sendErrorCallout } = useErrorCallout();

  const okapiKy = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();

  const { users, isLoading: usersIsLoading, refetch } = useUsersByRoleId(roleId, { tenantId });
  const { userGroups, isLoading: userGroupsIsLoading } = useUserGroups({ tenantId });
  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak(sendErrorCallout, { tenantId });

  const { mutateUpdateUserRoles } = useUpdateUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAssignRolesToUser } = useAssignRolesToUserMutation(sendErrorCallout, { tenantId });
  const { mutateDeleteUserRoles } = useDeleteUserRolesMutation(sendErrorCallout, { tenantId });

  const initialSelectedUsers = useMemo(() => keyBy(users, 'id'), [users]);

  /**
   * assignUsers
   * Callback from the plugin receives an updated list of selected users.
   * Since we only have 1/2 an API and cannot manipulate a role's users,
   * we instead have to manipulate each user's roles.
   *
   * @param {*} newSelectedUserIds
   * @param {*} userIdsToCompare
   */

  async function assignUsers(newSelectedUserIds, userIdsToCompare = []) {
    const requests = await createUserRolesRequests(userIdsToCompare, newSelectedUserIds, roleId, queryClient, okapiKy);
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
  }

  const onSubmitSelectedUsers = async (newSelectedUsers) => {
    setIsAuthUsersKeycloakConfirmationOpen(true);
    setCheckingUsersInKeycloak(true);

    const userIdsSet = new Set([...newSelectedUsers.map(x => x.id), ...Object.values(initialSelectedUsers).map(x => x.id)]);
    const nonKeycloakUserIdsList = await getNonKeycloakUsers({
      roleId,
      userIds: Array.from(userIdsSet),
      queryClient,
      ky: okapiKy
    });

    if (!nonKeycloakUserIdsList.length) {
      setIsAuthUsersKeycloakConfirmationOpen(false);
      await assignUsers(newSelectedUsers.map(x => x.id), Object.values(initialSelectedUsers).map(x => x.id));
      await refetch();
      return;
    }
    setNonKeycloakUsersList(nonKeycloakUsersList);
    setCheckingUsersInKeycloak(false);
    const keycloakUsersList = newSelectedUsers.map(x => x.id).filter(id => !nonKeycloakUsersList.includes(id));
    await assignUsers(keycloakUsersList, initialSelectedUsers);
  };

  const onSubmitCreateKeycloakUsersConfirmation = async () => {
    setIsAuthUsersKeycloakConfirmationOpen(false);
    for (const userId of nonKeycloakUsersList) {
      await createKeycloakUser(userId);
    }
    setNonKeycloakUsersList([]);
    await refetch();
  };


  if (usersIsLoading || userGroupsIsLoading) {
    return <Loading />;
  }

  const groupHash = keyBy(userGroups, 'id');

  users.sort((a, b) => {
    return getFullName(a).localeCompare(getFullName(b));
  });

  const usersData = users.map(i => {
    const fullName = (
      <TextLink to={`/users/preview/${i.id}?query=${i.username}`}>
        {getFullName(i)}
      </TextLink>
    );

    const patronGroup = groupHash[i.patronGroup]?.group || <NoValue />;

    return {
      fullName,
      patronGroup
    };
  });

  return (
    <Accordion
      label={
        <FormattedMessage id="stripes-authorization-components.assignedUsers" />
      }
      displayWhenClosed={
        <Badge>
          {users?.length || 0}
        </Badge>
      }
      displayWhenOpen={(
        <RoleDetailsAssignUsers
          tenantId={tenantId}
          onSubmitSelectedUsers={onSubmitSelectedUsers}
          initialSelectedUsers={initialSelectedUsers}
        />
      )}
    >
      <MultiColumnList
        columnMapping={{
          fullName: <FormattedMessage
            id="stripes-authorization-components.role-details.accordion-users.columns.fullName"
          />,
          patronGroup: <FormattedMessage
            id="stripes-authorization-components.role-details.accordion-users.columns.patronGroup"
          />,
        }}
        contentData={usersData}
        visibleColumns={['fullName', 'patronGroup']}
      />

      <ConfirmationModal
        open={isAuthUsersKeycloakConfirmationOpen}
        bodyTag="div"
        heading={formatMessage({ id: 'stripes-authorization-components.keycloak.records.confirmationLabel' })}
        message={checkingUsersInKeycloak ? <div style={{ display: 'flex', alignItems: 'center' }}><FormattedMessage
          id="stripes-authorization-components.keycloak.records.checking"
        /><Loading /></div> :
        <FormattedMessage
          id="stripes-authorization-components.keycloak.records.creation"
          values={{ users: nonKeycloakUsersList.join(', ') }}
        />
        }
        onConfirm={onSubmitCreateKeycloakUsersConfirmation}
        onCancel={async () => {
          setIsAuthUsersKeycloakConfirmationOpen(false);
          await refetch();
        }}
        confirmLabel={<FormattedMessage id="stripes-core.button.confirm" />}
        isConfirmButtonDisabled={checkingUsersInKeycloak}
      />
    </Accordion>
  );
};

RoleDetailsUsersAccordion.propTypes = {
  roleId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
