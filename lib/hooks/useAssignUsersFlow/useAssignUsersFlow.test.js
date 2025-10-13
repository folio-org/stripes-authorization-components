import { QueryClient, QueryClientProvider } from 'react-query';

import { useOkapiKy } from '@folio/stripes/core';
import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useAssignUsersFlow } from './useAssignUsersFlow';
import { useAssignRolesToUserMutation } from '../useAssignRolesToUserMutation';
import { useCreateAuthUserKeycloak } from '../useCreateAuthUserKeycloak';
import { getNonKeycloakUsers, createUserRolesRequests } from '../../RoleDetails/utils';
import { getErrorMessagesFromResponse, reportCreateKeycloakUserErrors } from '../../utils';

jest.mock('../useCreateAuthUserKeycloak', () => ({
  useCreateAuthUserKeycloak: jest.fn().mockReturnValue({
    mutateAsync: jest.fn(),
  }),
}));
jest.mock('../useUpdateUserRolesMutation', () => ({
  useUpdateUserRolesMutation: jest.fn().mockReturnValue({
    mutateUpdateUserRoles: jest.fn(),
  }),
}));
jest.mock('../useAssignRolesToUserMutation', () => ({
  useAssignRolesToUserMutation: jest.fn().mockReturnValue({
    mutateAssignRolesToUser: jest.fn().mockResolvedValue(),
  }),
}));
jest.mock('../useShowCallout', () => ({
  useShowCallout: jest.fn().mockReturnValue({
    showCallout: jest.fn(),
  }),
}));
jest.mock('../../RoleDetails/utils', () => ({
  apiVerbs: { PUT: 'PUT', POST: 'POST', DELETE: 'DELETE' },
  createUserRolesRequests: jest.fn().mockResolvedValue([
    { apiVerb: 'POST', userId: '1', roleIds: ['role1'] },
    { apiVerb: 'PUT', userId: '2', roleIds: ['role1'] },
    { apiVerb: 'DELETE', userId: '3', roleIds: [] },
  ]),
  getNonKeycloakUsers: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../utils', () => ({
  getErrorMessagesFromResponse: jest.fn(),
  reportCreateKeycloakUserErrors: jest.fn(),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAssignUsersFlow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    useOkapiKy.mockClear().mockReturnValue({
      get: jest.fn().mockReturnValue({ json: jest.fn() }),
      post: jest.fn().mockReturnValue({ json: jest.fn() }),
      put: jest.fn().mockReturnValue({ json: jest.fn() }),
      delete: jest.fn().mockReturnValue({ json: jest.fn() }),
    });
  });

  it('renders hook correctly', async () => {
    const { result } = renderHook(() => useAssignUsersFlow({
      roleId: '1',
      tenantId: 'diku2',
      users: [{ id: '1' }],
      refetch: jest.fn()
    }), { wrapper });

    expect(result.current.onSubmitSelectedUsers).toBeDefined();
    expect(result.current.onSubmitCreateKeycloakUsersConfirmation).toBeDefined();
    expect(result.current.isAuthUsersKeycloakConfirmationOpen).toBe(false);
    expect(result.current.checkingUsersInKeycloak).toBe(false);
    expect(result.current.nonKeycloakUsersList).toStrictEqual([]);
    expect(result.current.setIsAuthUsersKeycloakConfirmationOpen).toBeDefined();
  });

  it('calls onSubmit selected users', async () => {
    const { result } = renderHook(() => useAssignUsersFlow({
      roleId: '1',
      tenantId: 'diku2',
      users: [{ id: '2' }],
      refetch: jest.fn()
    }), { wrapper });

    result.current.onSubmitSelectedUsers([{ id: '1' }, { id: '3' }]);
    result.current.onSubmitCreateKeycloakUsersConfirmation();
  });

  it('calls onSubmitSelectedUsers and assigns users if all are keycloak users', async () => {
    getNonKeycloakUsers.mockResolvedValue([]);
    createUserRolesRequests.mockResolvedValue([
      { apiVerb: 'POST', userId: '1', roleIds: ['1'] }
    ]);
    const assignRolesMock = jest.fn().mockResolvedValue();
    useAssignRolesToUserMutation.mockReturnValue({ mutateAssignRolesToUser: assignRolesMock });

    const { result } = renderHook(() => useAssignUsersFlow({
      roleId: '1',
      tenantId: 'diku2',
      users: [{ id: '2' }],
      refetch: jest.fn()
    }), { wrapper });

    await act(async () => {
      await result.current.onSubmitSelectedUsers([{ id: '1' }, { id: '3' }]);
    });

    expect(result.current.isAuthUsersKeycloakConfirmationOpen).toBe(false);
    expect(assignRolesMock).toHaveBeenCalled();
  });

  it('calls onSubmitSelectedUsers and sets nonKeycloakUsersList if some users are not keycloak users', async () => {
    getNonKeycloakUsers.mockResolvedValue(['3']);
    createUserRolesRequests.mockResolvedValue([
      { apiVerb: 'POST', userId: '1', roleIds: ['1'] }
    ]);
    const assignRolesMock = jest.fn().mockResolvedValue();
    useAssignRolesToUserMutation.mockReturnValue({ mutateAssignRolesToUser: assignRolesMock });

    const { result } = renderHook(() => useAssignUsersFlow({
      roleId: '1',
      tenantId: 'diku2',
      users: [{ id: '2' }],
      refetch: jest.fn()
    }), { wrapper });

    await act(async () => {
      await result.current.onSubmitSelectedUsers([{ id: '1' }, { id: '3' }]);
    });

    expect(result.current.isAuthUsersKeycloakConfirmationOpen).toBe(true);
    expect(result.current.nonKeycloakUsersList).toEqual(['3']);
    expect(result.current.checkingUsersInKeycloak).toBe(false);
    expect(assignRolesMock).toHaveBeenCalled();
  });

  it('handles errors during keycloak user creation', async () => {
    const errorResponse = { name: 'Error', message: 'fail', response: {} };
    const createKeycloakUserMock = jest.fn().mockImplementation(() => {
      throw errorResponse;
    });
    useCreateAuthUserKeycloak.mockReturnValue({ mutateAsync: createKeycloakUserMock });
    getErrorMessagesFromResponse.mockResolvedValue(['errorMsg']);
    reportCreateKeycloakUserErrors.mockImplementation(jest.fn());

    const { result } = renderHook(() => useAssignUsersFlow({
      roleId: '1',
      tenantId: 'diku2',
      users: [{ id: '2' }],
      refetch: jest.fn()
    }), { wrapper });

    act(() => {
      result.current.setIsAuthUsersKeycloakConfirmationOpen(true);
    });
    act(() => {
      result.current.nonKeycloakUsersList.push('3');
    });

    await act(async () => {
      await result.current.onSubmitCreateKeycloakUsersConfirmation();
    });

    expect(reportCreateKeycloakUserErrors).toHaveBeenCalledWith(
      [{ userId: '3', error: 'errorMsg' }],
      'stripes-authorization-components.keycloak.records.create.error',
      expect.anything(),
      expect.anything()
    );
    expect(result.current.nonKeycloakUsersList).toEqual([]);
    expect(result.current.isAuthUsersKeycloakConfirmationOpen).toBe(false);
  });
});
