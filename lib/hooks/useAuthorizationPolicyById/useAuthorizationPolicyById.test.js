import { QueryClient, QueryClientProvider } from 'react-query';

import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
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

describe('useAuthorizationPolicyById', () => {
  it('should return an empty policies array if no data is fetched', async () => {
    const ky = jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({}),
    });

    useOkapiKy.mockReturnValue(ky);

    const { result } = renderHook(
      () => useAuthorizationPolicyById('id', { tenantId: 'tenant1' }),
      { wrapper }
    );

    expect(result.current.policies).toEqual([]);
  });

  it('should not fetch data if enabled is false', async () => {
    const ky = jest.fn().mockReturnValue({
      json: jest.fn().mockResolvedValue({}),
    });

    useOkapiKy.mockReturnValue(ky);

    renderHook(() => useAuthorizationPolicyById('2', { enabled: false }), { wrapper });

    expect(ky).not.toHaveBeenCalled();
  });
});
