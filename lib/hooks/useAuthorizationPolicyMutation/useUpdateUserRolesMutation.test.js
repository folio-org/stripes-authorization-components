import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';

import { useOkapiKy } from '@folio/stripes/core';

import { useAuthorizationPolicyMutation } from './useAuthorizationPolicyMutation';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useAuthorizationPolicyMutation', () => {
  it('should make POST request with provided data', async () => {
    const postMock = jest.fn().mockReturnValue({ json: () => Promise.resolve({}) });

    useOkapiKy.mockClear().mockReturnValue({
      post: postMock,
    });

    const { result } = renderHook(
      () => useAuthorizationPolicyMutation(),
      { wrapper },
    );

    await act(async () => result.current.mutatePolicy({ name: 'test', description: 'test' }));

    expect(postMock).toHaveBeenCalled();
  });

  it('should make PUT request with provided data includes policy id', async () => {
    const putMock = jest.fn().mockReturnValue({ json: () => Promise.resolve({}) });

    useOkapiKy.mockClear().mockReturnValue({
      put: putMock,
    });

    const { result } = renderHook(
      () => useAuthorizationPolicyMutation(),
      { wrapper },
    );

    await act(async () => result.current.mutatePolicy({ name: 'test', description: 'test', id: '1' }));

    expect(putMock).toHaveBeenCalled();
  });
});
