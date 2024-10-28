import { QueryClient, QueryClientProvider } from 'react-query';
import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';
import { useUserRolesById } from './useUserRolesById';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const userRolesData = {
  'userRoles': [
    {
      'userId': 'u1',
      'roleId': 'r1'
    },
    {
      'userId': 'u1',
      'roleId': 'r2'
    },
    {
      'userId': 'u2',
      'roleId': 'r1'
    },
    {
      'userId': 'u1',
      'roleId': 'r3'
    },
  ]
};

describe('useUserRolesByUserIds', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(userRolesData)
  }));


  beforeEach(() => {
    queryClient.clear();
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('fetches users assigned to a role', async () => {
    const { result } = renderHook(() => useUserRolesById('roleId',
      { tenantId: 'consortuim' }), { wrapper });
    await act(() => !result.current.isFetching);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.userRolesResponse).toEqual(userRolesData.userRoles);
  });
});

