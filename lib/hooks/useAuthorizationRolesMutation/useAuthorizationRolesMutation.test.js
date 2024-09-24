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

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: jest.fn().mockReturnValue({
    formatMessage: jest.fn((message) => message.id),
    formatDate: jest.fn(() => 'duplicate'),
  }),
}));

const postMock = jest.fn().mockReturnValue({ json: () => Promise.resolve(role) });
const getMock = (capabilities = [], capabilitySets = []) => jest.fn((path) => {
  if (path.includes('capability-sets')) {
    return ({
      json: () => Promise.resolve({ capabilitySets }),
    });
  } else if (path.includes('capabilities')) {
    return ({
      json: () => Promise.resolve({ capabilities }),
    });
  }

  return ({
    json: () => Promise.resolve(role),
  });
});

describe('useAuthorizationRolesMutation', () => {
  beforeEach(() => {
    postMock.mockClear();
  });

  it('should make POST request with `roles`, `capability-sets` and `capabilities` data', async () => {
    useOkapiKy.mockClear().mockReturnValue({
      get: getMock([capability], [capability]),
      post: postMock,
    });

    const { result } = renderHook(
      () => useAuthorizationRolesMutation(),
      { wrapper },
    );

    await act(async () => result.current.duplicateAuthorizationRole('1'));

    expect(postMock).toHaveBeenCalledTimes(3);
    expect(postMock.mock.calls[0][1]).toEqual({ 'json': { 'id': undefined, 'metadata': undefined, 'name': 'role stripes-authorization-components.crud.duplicate.suffix - duplicate' } });
  });

  describe('when there is no `capability-sets` and `capabilities`', () => {
    it('should make POST request with `roles` data', async () => {
      useOkapiKy.mockClear().mockReturnValue({
        get: getMock(),
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

  describe('when there is no `capabilitySets`', () => {
    it('should make POST request with `roles` and `capabilities` data', async () => {
      useOkapiKy.mockClear().mockReturnValue({
        get: getMock([capability]),
        post: postMock,
      });

      const { result } = renderHook(
        () => useAuthorizationRolesMutation(),
        { wrapper },
      );

      await act(async () => result.current.duplicateAuthorizationRole('1'));

      expect(postMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('when there is no `capabilities`', () => {
    it('should make POST request with `roles` and `capability-sets` data', async () => {
      useOkapiKy.mockClear().mockReturnValue({
        get: getMock([], [capability]),
        post: postMock,
      });

      const { result } = renderHook(
        () => useAuthorizationRolesMutation(),
        { wrapper },
      );

      await act(async () => result.current.duplicateAuthorizationRole('1'));

      expect(postMock).toHaveBeenCalledTimes(2);
    });
  });
});
