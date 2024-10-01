import { useOkapiKy } from '@folio/stripes/core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useAssignUsersFlow } from './useAssignUsersFlow';

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
      tenantId: 'dikku2',
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
      tenantId: 'dikku2',
      users: [{ id: '2' }],
      refetch: jest.fn()
    }), { wrapper });

    result.current.onSubmitSelectedUsers([{ id: '1' }, { id: '3' }]);
    result.current.onSubmitCreateKeycloakUsersConfirmation();
  });
});
