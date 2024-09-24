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
import { usePolicySharing } from './usePolicySharing';

const queryClient = new QueryClient();

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const policy = {
  id: 'policy-id',
  name: 'policy-name',
};

const kyMock = {
  get: jest.fn(() => ({ json: () => Promise.resolve(pcPublicationResults) })),
  post: jest.fn(() => ({ json: () => Promise.resolve(pcPublicationDetails) })),
};

describe('usePolicySharing', () => {
  beforeEach(() => {
    kyMock.get.mockClear();
    kyMock.post.mockClear();
    useOkapiKy
      .mockClear()
      .mockReturnValue(kyMock);
  });

  it('should make post request with provided policy data', async () => {
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => usePolicySharing({ onSuccess }),
      { wrapper },
    );

    await act(async () => result.current.upsertSharedPolicy({ policy }));
    await waitFor(async () => expect(result.current.isLoading).toBeFalsy());

    expect(kyMock.post).toHaveBeenCalled();
    expect(kyMock.get).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
});
