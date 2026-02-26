import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  act,
  renderHook,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import { useInitialRoleSharing } from './useInitialRoleSharing';
import { usePublishCoordinator } from '../usePublishCoordinator';
import { useRoleSharing } from '../useRoleSharing';

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  getConsortiumTenants: jest.fn(() => ({
    tenants: [
      { id: 'tenant-1', name: 'Tenant 1' },
      { id: 'tenant-2', name: 'Tenant 2' },
    ],
  })),
}));
jest.mock('../../useRoleCapabilities', () => ({
  useRoleCapabilities: jest.fn(() => ({ initialRoleCapabilitiesNames: jest.fn() })),
}));
jest.mock('../../useRoleCapabilitySets', () => ({
  useRoleCapabilitySets: jest.fn(() => ({ initialRoleCapabilitySetsNames: jest.fn() })),
}));
jest.mock('../usePublishCoordinator', () => ({ usePublishCoordinator: jest.fn() }));
jest.mock('../useRoleSharing', () => ({ useRoleSharing: jest.fn() }));

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

describe('useRoleSharing', () => {
  const initPublicationRequest = jest.fn(() => ({
    publicationErrors: [],
    publicationResults: [],
  }));
  const upsertSharedRole = jest.fn();

  beforeEach(() => {
    usePublishCoordinator.mockReturnValue({ initPublicationRequest });
    useRoleSharing.mockReturnValue({ upsertSharedRole });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call upsertSharedRole to initiate role sharing', async () => {
    const { result } = renderHook(
      () => useInitialRoleSharing(role, { tenantId: 'tenantId' }),
      { wrapper },
    );

    await act(async () => {
      await result.current.shareRole();
    });
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());

    expect(upsertSharedRole).toHaveBeenCalled();
  });

  describe('Validation', () => {
    it('should throw an error if there are some publication errors in some tenants', async () => {
      initPublicationRequest.mockResolvedValue({
        publicationErrors: [{ tenantId: 'tenant-2' }],
        publicationResults: [],
      });

      const { result } = renderHook(
        () => useInitialRoleSharing(role, { tenantId: 'tenantId' }),
        { wrapper },
      );

      await act(async () => {
        await expect(result.current.shareRole()).rejects.toThrow(Error);
      });
    });
    it('should throw an error if there are conflicting tenants with duplicate role names', async () => {
      initPublicationRequest.mockResolvedValue({
        publicationErrors: [],
        publicationResults: [
          { tenantId: 'tenant-1', response: { totalRecords: 1 } },
          { tenantId: 'tenant-2', response: { totalRecords: 0 } },
        ],
      });

      const { result } = renderHook(
        () => useInitialRoleSharing(role, { tenantId: 'tenantId' }),
        { wrapper },
      );

      await act(async () => {
        await expect(result.current.shareRole()).rejects.toThrow(Error);
      });
    });

    it('should not throw if there are no publication errors or duplicate role names', async () => {
      initPublicationRequest.mockResolvedValue({
        publicationErrors: [],
        publicationResults: [
          { tenantId: 'tenant-1', response: { totalRecords: 0 } },
          { tenantId: 'tenant-2', response: { totalRecords: 0 } },
        ],
      });

      const { result } = renderHook(
        () => useInitialRoleSharing(role, { tenantId: 'tenantId' }),
        { wrapper },
      );

      await act(async () => {
        await expect(result.current.shareRole()).resolves.not.toThrow();
      });
    });
  });
});
