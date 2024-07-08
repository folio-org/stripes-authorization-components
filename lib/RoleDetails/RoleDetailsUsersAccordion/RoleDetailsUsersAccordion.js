import keyBy from 'lodash/keyBy';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Badge,
  Loading,
  MultiColumnList,
  NoValue,
  TextLink,
} from '@folio/stripes/components';

import { getFullName } from '@folio/stripes/util';

import { useUserGroups, useUsersByRoleId } from '../../hooks';
import { RoleDetailsAssignUsers } from '../RoleDetailsAssignUsers/RoleDetailsAssignUsers';

export const RoleDetailsUsersAccordion = ({ roleId }) => {
  const { users, isLoading: usersIsLoading, refetch } = useUsersByRoleId(roleId, true);
  const { userGroups, isLoading: userGroupsIsLoading } = useUserGroups();

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
          selectedUsers={users}
          roleId={roleId}
          refetch={refetch}
        />
      )}
    >
      <MultiColumnList
        columnMapping={{
          fullName: <FormattedMessage id="stripes-authorization-components.role-details.accordion-users.columns.fullName" />,
          patronGroup: <FormattedMessage id="stripes-authorization-components.role-details.accordion-users.columns.patronGroup" />,
        }}
        contentData={usersData}
        visibleColumns={['fullName', 'patronGroup']}
      />
    </Accordion>
  );
};

RoleDetailsUsersAccordion.propTypes = {
  roleId: PropTypes.string.isRequired
};
