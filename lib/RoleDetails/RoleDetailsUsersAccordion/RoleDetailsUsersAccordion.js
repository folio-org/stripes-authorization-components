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
  const [nonKeycloakUsersList, setNonKeycloakUsersList] = useState([]);
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

  const onSubmitCreateKeycloakAuthUsers = async () => {
    setIsAuthUsersKeycloakConfirmationOpen(false);
    for (const userId of nonKeycloakUsersList) {
      await createKeycloakUser(userId);
    }
    setNonKeycloakUsersList([]);
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
          setNonKeycloakUsersList={setNonKeycloakUsersList}
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
        onConfirm={onSubmitCreateKeycloakAuthUsers}
        onCancel={() => {
          setIsAuthUsersKeycloakConfirmationOpen(false);
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
