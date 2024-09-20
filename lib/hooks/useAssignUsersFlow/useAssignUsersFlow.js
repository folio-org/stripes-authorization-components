import { useMemo, useState } from 'react';
import keyBy from 'lodash/keyBy';
import { useOkapiKy } from '@folio/stripes/core';
import { useQueryClient } from 'react-query';
import { useUpdateUserRolesMutation } from '../useUpdateUserRolesMutation';
import { useAssignRolesToUserMutation } from '../useAssignRolesToUserMutation';
import { useDeleteUserRolesMutation } from '../useDeleteUserRolesMutation';
import { useErrorCallout } from '../useErrorCallout';
import { useUsersByRoleId } from '../useUsersByRoleId';
import { apiVerbs, createUserRolesRequests, getNonKeycloakUsers } from '../../RoleDetails/utils';
import { USERS_BY_ROLE_ID_QUERY_KEY } from '../../constants';
import { useCreateAuthUserKeycloak } from '../useCreateAuthUserKeycloak';

export function useAssignUsersFlow({ roleId, tenantId }) {
  const okapiKy = useOkapiKy({ tenant: tenantId });
  const queryClient = useQueryClient();

  const [nonKeycloakUsersList, setNonKeycloakUsersList] = useState([]);
  const [isAuthUsersKeycloakConfirmationOpen, setIsAuthUsersKeycloakConfirmationOpen] = useState(false);
  const [checkingUsersInKeycloak, setCheckingUsersInKeycloak] = useState(false);

  const { sendErrorCallout } = useErrorCallout();
  const { users, isLoading: usersIsLoading, refetch } = useUsersByRoleId(roleId, { tenantId });
  const { mutateUpdateUserRoles } = useUpdateUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAssignRolesToUser } = useAssignRolesToUserMutation(sendErrorCallout, { tenantId });
  const { mutateDeleteUserRoles } = useDeleteUserRolesMutation(sendErrorCallout, { tenantId });
  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak(sendErrorCallout, { tenantId });

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
    setNonKeycloakUsersList(nonKeycloakUserIdsList);
    setCheckingUsersInKeycloak(false);
    const keycloakUsersList = newSelectedUsers.map(x => x.id).filter(id => !nonKeycloakUserIdsList.includes(id));
    await assignUsers(keycloakUsersList, Object.values(initialSelectedUsers).map(x => x.id));
  };

  const onSubmitCreateKeycloakUsersConfirmation = async () => {
    setIsAuthUsersKeycloakConfirmationOpen(false);
    for (const userId of nonKeycloakUsersList) {
      await createKeycloakUser(userId);
    }
    await assignUsers(nonKeycloakUsersList, []);
    setNonKeycloakUsersList([]);
    await refetch();
  };

  return {
    onSubmitSelectedUsers,
    onSubmitCreateKeycloakUsersConfirmation,
    initialSelectedUsers,
    users,
    isAuthUsersKeycloakConfirmationOpen,
    checkingUsersInKeycloak,
    usersIsLoading,
    nonKeycloakUsersList,
    setIsAuthUsersKeycloakConfirmationOpen,
    refetch
  };
}

