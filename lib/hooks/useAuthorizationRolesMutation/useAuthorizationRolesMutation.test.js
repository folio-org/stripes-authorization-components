import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useAuthorizationRolesMutation } from './useAuthorizationRolesMutation';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const capability = {
  id: '1',
  name: 'test',
  description: 'test',
};

const role = {
  id: '1',
  name: 'role',
};

const postMock = jest.fn().mockReturnValue({ json: () => Promise.resolve(role) });

describe('useAuthorizationRolesMutation', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('should make POST request with `roles`, `capability-sets` and `capabilities` data', async () => {
    useOkapiKy.mockClear().mockReturnValue({
      get: jest.fn((path) => {
        console.log('path', path);
        if (path.includes('capability-sets')) {
          return ({
            json: () => Promise.resolve({ capabilitySets: [capability] }),
          });
        } else if (path.includes('capabilities')) {
          return ({
            json: () => Promise.resolve({ capabilities: [capability] }),
          });
        }

        return ({
          json: () => Promise.resolve(role),
        });
      }),
      post: postMock,
    });

    const { result } = renderHook(
      () => useAuthorizationRolesMutation(),
      { wrapper },
    );

    await act(async () => result.current.duplicateAuthorizationRole('1'));

    expect(postMock).toHaveBeenCalledTimes(3);
    expect(postMock.mock.calls[0][1]).toEqual({ 'json': { 'id': undefined, 'metadata': undefined, 'name': 'role - duplicate' } });
  });

  it('should not make POST request with `capability-sets` if there is no capabilitySets', async () => {
    useOkapiKy.mockClear().mockReturnValue({
      get: jest.fn((path) => {
        if (path.includes('capability-sets')) {
          return ({
            json: () => Promise.resolve({ capabilitySets: [] }),
          });
        } else if (path.includes('capabilities')) {
          return ({
            json: () => Promise.resolve({ capabilities: [capability] }),
          });
        }

        return ({
          json: () => Promise.resolve(role),
        });
      }),
      post: postMock,
    });

    const { result } = renderHook(
      () => useAuthorizationRolesMutation(),
      { wrapper },
    );

    await act(async () => result.current.duplicateAuthorizationRole('1'));

    expect(postMock).toHaveBeenCalledTimes(2);
  });

  it('should not make POST request with `capability-sets` and and `capabilities` if there is no capability-sets and capabilities data', async () => {
    useOkapiKy.mockClear().mockReturnValue({
      get: jest.fn((path) => {
        if (path.includes('capability-sets')) {
          return ({
            json: () => Promise.resolve({ capabilitySets: [] }),
          });
        } else if (path.includes('capabilities')) {
          return ({
            json: () => Promise.resolve({ capabilities: [] }),
          });
        }

        return ({
          json: () => Promise.resolve(role),
        });
      }),
      post: postMock,
    });

    const { result } = renderHook(
      () => useAuthorizationRolesMutation(),
      { wrapper },
    );

    await act(async () => result.current.duplicateAuthorizationRole('1'));

    expect(postMock).toHaveBeenCalledTimes(1);
  });
});
