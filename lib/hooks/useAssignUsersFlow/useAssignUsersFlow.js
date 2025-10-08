import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import keyBy from 'lodash/keyBy';
import { useOkapiKy } from '@folio/stripes/core';
import { useQueryClient } from 'react-query';

import { useUpdateUserRolesMutation } from '../useUpdateUserRolesMutation';
import { useAssignRolesToUserMutation } from '../useAssignRolesToUserMutation';
import { useDeleteUserRolesMutation } from '../useDeleteUserRolesMutation';
import { useErrorCallout } from '../useErrorCallout';
import { apiVerbs, createUserRolesRequests, getNonKeycloakUsers } from '../../RoleDetails/utils';
import { useCreateAuthUserKeycloak } from '../useCreateAuthUserKeycloak';
import { useShowCallout } from '../useShowCallout';
import { getErrorMessagesFromResponse } from '../../utils';

/**
 * Custom hook to handle assigning users to roles, including interaction with Keycloak for user creation and validation.
 *
 * @param {Object} params - The parameters for the hook.
 * @param {string} params.roleId - The ID of the role to which users will be assigned.
 * @param {string} params.tenantId - The tenant ID.
 * @param {Array} params.users - The list of role users.
 * @param {Function} params.refetch - Function to refetch users data after changes.
 *
 * @returns {Object} - Returns an object containing handlers and state related to user assignment.
 * @returns {Function} onSubmitSelectedUsers - Handler to assign roles to selected users, checking Keycloak existence.
 * @returns {Function} onSubmitCreateKeycloakUsersConfirmation - Handler to create non-Keycloak users and assign them roles.
 * @returns {boolean} isAuthUsersKeycloakConfirmationOpen - Flag to control the visibility of Keycloak user creation confirmation modal.
 * @returns {boolean} checkingUsersInKeycloak - Flag to indicate if the hook is currently checking if users exist in Keycloak.
 * @returns {Array} nonKeycloakUsersList - The list of users who do not exist in Keycloak.
 * @returns {Function} setIsAuthUsersKeycloakConfirmationOpen - Function to control the Keycloak confirmation modal state.
 *
 * @description
 * This hook manages the process of assigning users to roles within an application, handling three main flows:
 * 1. Verifying which users are already in Keycloak.
 * 2. Assigning roles to users (either existing or newly created in Keycloak).
 * 3. Displaying confirmation modals when new users need to be created in Keycloak, assigning keycloak existing users on the background
 */

export function useAssignUsersFlow({ roleId, tenantId, users, refetch }) {
  const okapiKy = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();

  const [nonKeycloakUsersList, setNonKeycloakUsersList] = useState([]);
  const [isAuthUsersKeycloakConfirmationOpen, setIsAuthUsersKeycloakConfirmationOpen] = useState(false);
  const [checkingUsersInKeycloak, setCheckingUsersInKeycloak] = useState(false);

  const intl = useIntl();
  const { sendErrorCallout } = useErrorCallout();
  const showCallout = useShowCallout();
  const { mutateUpdateUserRoles } = useUpdateUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAssignRolesToUser } = useAssignRolesToUserMutation(sendErrorCallout, { tenantId });
  const { mutateDeleteUserRoles } = useDeleteUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak((error) => { return error; }, { tenantId });

  const initialSelectedUsers = useMemo(() => keyBy(users, 'id'), [users]);

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
      refetch();
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
      return;
    }
    setNonKeycloakUsersList(nonKeycloakUserIdsList);
    setCheckingUsersInKeycloak(false);
    const keycloakUsersList = newSelectedUsers.map(x => x.id).filter(id => !nonKeycloakUserIdsList.includes(id));
    await assignUsers(keycloakUsersList, Object.values(initialSelectedUsers).map(x => x.id));
  };

  // If there are nonkeycloak users -  confirmation dialog is shown. On submit function.
  // 1. Create users in keycloak;
  // 2. Assigns that users to the role;
  // 3. Refetch role users data.
  const onSubmitCreateKeycloakUsersConfirmation = async () => {
    const recordsWithError = [];
    const recordsCreated = [];
    setIsAuthUsersKeycloakConfirmationOpen(false);

    for (const userId of nonKeycloakUsersList) {
      try {
        await createKeycloakUser(userId);
        recordsCreated.push(userId);
      } catch ({ name, message, response }) {
        const errorMessage = await getErrorMessagesFromResponse({ response });
        for (const msg of errorMessage) {
          recordsWithError.push({ userId, error: msg });
        }
      }
    }

    if (recordsWithError.length) {
      const errorMessages = {};
      // Group same error messages together like { 'error message': [userId1, userId2], ... }
      for (const { error, userId } of recordsWithError) {
        errorMessages[error] ??= [];
        errorMessages[error].push(userId);
      }

      for (const [error, records] of Object.entries(errorMessages)) {
        const errorMessage = intl.formatMessage({
          id: 'stripes-authorization-components.keycloak.records.create.error' }, { users: records.join(', '), error });
        sendErrorCallout(errorMessage);
      }
    }
    if (recordsCreated.length) {
      showCallout({
        messageId: 'stripes-authorization-components.keycloak.records.created',
        values: { users: recordsCreated.join(', ') }
      });
      await assignUsers(recordsCreated, []);
    }

    setNonKeycloakUsersList([]);
  };

  return {
    onSubmitSelectedUsers,
    onSubmitCreateKeycloakUsersConfirmation,
    isAuthUsersKeycloakConfirmationOpen,
    checkingUsersInKeycloak,
    nonKeycloakUsersList,
    setIsAuthUsersKeycloakConfirmationOpen,
  };
}

