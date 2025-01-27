import { render } from '@folio/jest-config-stripes/testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { renderWithRouter } from 'helpers';
import {
  useUserGroups,
  useUsersByRoleId,
} from '../../hooks';
import { RoleDetailsUsersAccordion } from './RoleDetailsUsersAccordion';

jest.mock('../RoleDetailsAssignUsers');
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useUserGroups: jest.fn(),
  useUsersByRoleId: jest.fn(),
}));

const queryClient = new QueryClient();

const users = [
  {
    'username': 'aapple',
    'id': 'a1',
    'active': true,
    'type': 'staff',
    'patronGroup': 'pg1',
    'personal': {
      'lastName': 'Andrea',
      'firstName': 'Apple',
      'middleName': 'A'
    },
  },
  {
    'username': 'bblick',
    'id': 'b2',
    'active': true,
    'type': 'staff',
    'patronGroup': 'pg2',
    'personal': {
      'lastName': 'Bethany',
      'firstName': 'Blick',
      'middleName': 'B'
    }
  }
];

const userGroups = [
  { id: 'pg1', desc: 'The Flaming lips', group: 'lips' },
  { id: 'pg2', desc: 'Belle and Sebastian', group: 'belle' },
];

const renderComponent = () => render(
  renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <RoleDetailsUsersAccordion roleId="1" />
    </QueryClientProvider>
  )
);

describe('RoleDetailsUsersAccordion', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('displays accordion', () => {
    useUsersByRoleId.mockReturnValue({ users, isLoading: false });
    useUserGroups.mockReturnValue({ userGroups, isLoading: false });
    const { getByText } = renderComponent();

    it('render expanded role info by default', () => {
      getByText('stripes-authorization-components.assignedUsers');
      getByText(users[0].personal.firstName, { exact: false });
      getByText(users[1].personal.firstName, { exact: false });
      getByText(userGroups[0].group, { exact: false });
      getByText(userGroups[1].group, { exact: false });
    });
  });

  it('render loading spinner', () => {
    useUsersByRoleId.mockReturnValue({ isLoading: true, users: [] });

    const { getByText } = renderComponent();

    getByText('Loading');
  });
});
