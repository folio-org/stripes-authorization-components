import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';

import { usePublishCoordinator } from '../usePublishCoordinator';
import { useSharedRoleValidator } from './useSharedRoleValidator';

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  getConsortiumTenants: jest.fn(() => ({
    tenants: [
      { id: 'tenant-1', name: 'Tenant 1' },
      { id: 'tenant-2', name: 'Tenant 2' },
    ],
  })),
}));
jest.mock('../usePublishCoordinator', () => ({ usePublishCoordinator: jest.fn() }));

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

describe('useSharedRoleValidator', () => {
  const initPublicationRequest = jest.fn(() => ({
    publicationErrors: [],
    publicationResults: [],
  }));

  beforeEach(() => {
    usePublishCoordinator.mockReturnValue({ initPublicationRequest });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if there are some publication errors in some tenants', async () => {
    initPublicationRequest.mockResolvedValue({
      publicationErrors: [{ tenantId: 'tenant-2' }],
      publicationResults: [],
    });

    const { result } = renderHook(() => useSharedRoleValidator(), { wrapper });

    await act(async () => {
      await expect(result.current.validate({ role })).rejects.toThrow(Error);
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

    const { result } = renderHook(() => useSharedRoleValidator(), { wrapper });

    await act(async () => {
      await expect(result.current.validate({ role })).rejects.toThrow(Error);
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

    const { result } = renderHook(() => useSharedRoleValidator(), { wrapper });

    await act(async () => {
      await expect(result.current.validate({ role })).resolves.not.toThrow();
    });
  });
});
