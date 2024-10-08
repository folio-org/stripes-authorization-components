import { QueryClient, QueryClientProvider } from 'react-query';

import { act, renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useUserGroups } from './useUserGroups';


const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const data = {
  'usergroups': [
    {
      'group': 'faculty',
      'desc': 'Faculty Member',
      'id': '503a81cd-6c26-400f-b620-14c08943697c',
    },
    {
      'group': 'graduate',
      'desc': 'Graduate Student',
      'id': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
    },
  ],
  'totalRecords': 6
};

describe('useUsergroups', () => {
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(data),
  }));

  beforeEach(() => {
    queryClient.clear();
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
  });

  it('fetches groups', async () => {
    const { result } = renderHook(() => useUserGroups(), { wrapper });
    await act(() => result.current.isSuccess);

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.userGroups).toEqual(data.usergroups);
  });

  it('should not fetch data if enabled is false', async () => {
    const kyMock = jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({}),
    });
    useOkapiKy.mockReturnValue({ get: kyMock });
    renderHook(() => useUserGroups({ enabled: false }), { wrapper });
    expect(kyMock).not.toHaveBeenCalled();
  });
});
