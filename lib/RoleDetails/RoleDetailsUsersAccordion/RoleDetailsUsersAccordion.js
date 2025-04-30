import keyBy from 'lodash/keyBy';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Accordion,
  Badge,
  Loading,
  MultiColumnList,
  NoValue,
  ConfirmationModal,
} from '@folio/stripes/components';
import { LinkedUser } from '@folio/stripes/smart-components';
import { getFullName } from '@folio/stripes/util';

import {
  useUserGroups,
  useAssignUsersFlow, useUsersByRoleId
} from '../../hooks';
import { RoleDetailsAssignUsers } from '../RoleDetailsAssignUsers/RoleDetailsAssignUsers';

export const RoleDetailsUsersAccordion = ({ hideUserLink, roleId, tenantId }) => {
  const { formatMessage } = useIntl();

  const { users, isLoading: usersIsLoading, refetch } = useUsersByRoleId(roleId, { tenantId });
  const { userGroups, isLoading: userGroupsIsLoading } = useUserGroups({ tenantId });

  const initialSelectedUsers = useMemo(() => keyBy(users, 'id'), [users]);

  const {
    nonKeycloakUsersList,
    checkingUsersInKeycloak,
    setIsAuthUsersKeycloakConfirmationOpen,
    isAuthUsersKeycloakConfirmationOpen,
    onSubmitSelectedUsers,
    onSubmitCreateKeycloakUsersConfirmation,
  } = useAssignUsersFlow({ roleId, tenantId, refetch, users });

  const groupHash = keyBy(userGroups, 'id');

  const sortedUsers = [...users].sort((a, b) => {
    return getFullName(a).localeCompare(getFullName(b));
  });

  const usersData = sortedUsers.map(i => {
    const fullName = hideUserLink ? getFullName(i) : (<LinkedUser user={i} />);
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
      {usersIsLoading || userGroupsIsLoading ? <Loading /> : <MultiColumnList
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
      />}

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
        }}
        confirmLabel={<FormattedMessage id="stripes-core.button.confirm" />}
        isConfirmButtonDisabled={checkingUsersInKeycloak}
      />
    </Accordion>
  );
};

RoleDetailsUsersAccordion.propTypes = {
  hideUserLink: PropTypes.string.isRequired,
  roleId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
