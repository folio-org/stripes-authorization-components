import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  act,
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import { useOkapiKy } from '@folio/stripes/core';

import {
  pcPublicationDetails,
  pcPublicationResults,
} from 'fixtures';
import { useRoleSharing } from './useRoleSharing';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const role = {
  id: 'role-id',
  name: 'role-name',
};

const kyMock = {
  get: jest.fn(() => ({ json: () => Promise.resolve(pcPublicationResults) })),
  post: jest.fn(() => ({ json: () => Promise.resolve(pcPublicationDetails) })),
  delete: jest.fn(() => ({ json: () => Promise.resolve(pcPublicationDetails) })),
};

describe('useRoleSharing', () => {
  beforeEach(() => {
    kyMock.get.mockClear();
    kyMock.post.mockClear();
    useOkapiKy
      .mockClear()
      .mockReturnValue(kyMock);
  });

  it('should make post request with provided role data', async () => {
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useRoleSharing({ onSuccess }),
      { wrapper },
    );

    await act(async () => result.current.upsertSharedRole({
      role,
      shouldUpdateCapabilities: true,
      shouldUpdateCapabilitySets: true,
      capabilityNames: [],
      capabilitySetNames: [],
    }));

    await waitFor(async () => expect(result.current.isLoading).toBeFalsy());

    expect(kyMock.post).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('should make delete request with provided role data', async () => {
    const { result } = renderHook(
      () => useRoleSharing(),
      { wrapper },
    );

    await act(async () => result.current.deleteSharedRole({ role }));
    await waitFor(async () => expect(result.current.isLoading).toBeFalsy());

    expect(kyMock.delete).toHaveBeenCalled();
  });
});
