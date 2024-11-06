import { render } from '@folio/jest-config-stripes/testing-library/react';

import { Pluggable } from '@folio/stripes/core';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  useAssignRolesToUserMutation,
  useDeleteUserRolesMutation,
  useUpdateUserRolesMutation,
  useUserRolesByUserIds,
} from '../../hooks';
import { RoleDetailsAssignUsers } from './RoleDetailsAssignUsers';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));
jest.mock('../utils', () => {
  return {
    ...jest.requireActual('../../utils'),
    apiVerbs: {
      PUT: 'put',
      DELETE: 'delete',
      POST: 'post',
      PATCH: 'patch',
    },
    getNonKeycloakUsers: jest.fn(() => ([])),
    createUserRolesRequests: jest.fn().mockReturnValue([{ apiVerb: 'put', userId: '1', roleIds: [] },
      { apiVerb: 'post', userId: '3', roleIds: [] },
      { apiVerb: 'delete', userId: '5', roleIds: [] }
    ])
  };
});

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: () => ({
    hasPerm: jest.fn().mockReturnValue(true),
    user: {
      user: {
        tenants: [{ id: 'college', name: 'College' }]
      }
    }
  }),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAssignRolesToUserMutation: jest.fn(),
  useDeleteUserRolesMutation: jest.fn(),
  useUpdateUserRolesMutation: jest.fn(),
  useUserRolesByUserIds: jest.fn(),
}));

const userRoles = {
  'userRoles': [
    {
      'userId': '1',
      'roleId': '555',
    },
    {
      'userId': '3',
      'roleId': '111',
    },
    {
      'userId': '5',
      'roleId': '222'
    }
  ]
};

const renderComponent = () => render(
  <RoleDetailsAssignUsers
    onSubmitSelectedUsers={jest.fn()}
    tenantId="tenant1"
    initialSelectedUsers={[{ id: '1' }]}
  />
);

describe('RoleDetailsAssignUsers', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('displays AssignUsers', () => {
    useUserRolesByUserIds.mockReturnValue({ roleDetails: userRoles, isLoading: false });
    useAssignRolesToUserMutation.mockReturnValue({ mutateAssignRolesToUser: jest.fn(), isLoading: false });
    useUpdateUserRolesMutation.mockReturnValue({ mutateUpdateUserRoles: jest.fn(), isLoading: false });
    useDeleteUserRolesMutation.mockReturnValue({ mutateDeleteUserRoles: jest.fn(), isLoading: false });
    const { getByText } = renderComponent();

    it('doesn\'t render assign button', () => {
      getByText('ui-users.permissions.assignUsers.actions.assign.notAvailable');
    });
  });

  describe('assign users function', () => {
    it('calls assign users mutation functions', async () => {
      Pluggable.mockImplementationOnce(({ selectUsers }) => {
        return <div data-testid="pluggable-find-user">
          <button
            data-testid="pluggable-submit-button"
            type="button"
            onClick={() => selectUsers([{ id: '5' }])}
          >Find user
          </button>
        </div>;
      });

      const { getByTestId } = renderComponent();

      await userEvent.click(getByTestId('pluggable-submit-button'));
    });
  });
});
