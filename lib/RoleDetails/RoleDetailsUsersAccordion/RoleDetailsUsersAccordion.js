import { useState } from 'react';
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

import { useErrorCallout, useUserGroups, useUsersByRoleId, useCreateAuthUserKeycloak } from '../../hooks';
import { RoleDetailsAssignUsers } from '../RoleDetailsAssignUsers/RoleDetailsAssignUsers';

export const RoleDetailsUsersAccordion = ({ roleId, tenantId }) => {
  const { formatMessage } = useIntl();
  const [keycloakNoneExistingUsers, setKeycloakNoneExistingUsers] = useState([]);
  const [isAuthUsersKeycloakConfirmationOpen, setIsAuthUsersKeycloakConfirmationOpen] = useState(false);
  const [checkingUsersInKeycloak, setCheckingUsersInKeycloak] = useState(false);
  const { sendErrorCallout } = useErrorCallout();

  const { users, isLoading: usersIsLoading, refetch } = useUsersByRoleId(roleId, { tenantId });
  const { userGroups, isLoading: userGroupsIsLoading } = useUserGroups({ tenantId });
  const { mutateAsync: createKeycloakUser } = useCreateAuthUserKeycloak(sendErrorCallout, { tenantId });

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

  const onSubmitCreateKeycloakAuthUser = async () => {
    setIsAuthUsersKeycloakConfirmationOpen(false);
    for (const userId of keycloakNoneExistingUsers) {
      await createKeycloakUser(userId);
    }
    setKeycloakNoneExistingUsers([]);
  };

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
          setKeycloakNoneExistingUsers={setKeycloakNoneExistingUsers}
          setIsAuthUsersKeycloakConfirmationOpen={setIsAuthUsersKeycloakConfirmationOpen}
          setCheckingUsersInKeycloak={setCheckingUsersInKeycloak}
          selectedUsers={users}
          roleId={roleId}
          refetch={refetch}
          tenantId={tenantId}
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
        heading={formatMessage({ id: 'stripes-authorization-components.keycloak.records.confirmationLabel' })}
        message={checkingUsersInKeycloak ? <FormattedMessage
          id="stripes-authorization-components.keycloak.records.checking"
        /> :
        <FormattedMessage
          id="stripes-authorization-components.keycloak.records.creation"
          values={{ users: keycloakNoneExistingUsers.join(', ') }}
        />
        }
        onConfirm={onSubmitCreateKeycloakAuthUser}
        onCancel={() => {
          setIsAuthUsersKeycloakConfirmationOpen(false);
        }}
        confirmLabel={<FormattedMessage id="stripes-authorization-components.button.confirm" />}
        isConfirmButtonDisabled={checkingUsersInKeycloak}
      />
    </Accordion>
  );
};

RoleDetailsUsersAccordion.propTypes = {
  roleId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
