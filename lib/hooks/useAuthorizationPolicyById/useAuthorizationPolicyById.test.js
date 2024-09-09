import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook, act } from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import { useAuthorizationPolicyById } from './useAuthorizationPolicyById';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useNamespace: () => ['namespace'],
  useOkapiKy: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const policy = {
  id: 'id',
  name: 'name',
  description: 'description',
};

describe('useAuthorizationPolicyById', () => {
  const ky = jest.fn().mockReturnValue({
    json: () => Promise.resolve(policy),
  });

  beforeEach(() => {
    queryClient.clear();
    ky.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: ky,
    });
  });

  it('should return policy with id', async () => {
    const { result } = renderHook(
      () => useAuthorizationPolicyById('id'),
      { wrapper }
    );

    await act(() => !result.current.isFetching);

    expect(result.current.policy).toEqual(policy);
  });

  describe('should not return policy', () => {
    const getMock = jest.fn();

    beforeEach(() => {
      useOkapiKy.mockClear().mockReturnValue({
        get: getMock,
      });
    });

    it('when `id` is not present', async () => {
      const { result } = renderHook(
        () => useAuthorizationPolicyById(),
        { wrapper }
      );

      await act(() => !result.current.isFetching);

      expect(getMock).not.toHaveBeenCalled();
    });

    it('when enabled option is `false`', async () => {
      const { result } = renderHook(
        () => useAuthorizationPolicyById('1', { enabled: false }),
        { wrapper }
      );

      await act(() => !result.current.isFetching);

      expect(getMock).not.toHaveBeenCalled();
    });
  });
});
