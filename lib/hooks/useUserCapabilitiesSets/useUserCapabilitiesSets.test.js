import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  useOkapiKy,
  useStripes,
} from '@folio/stripes/core';

import { useUserCapabilitiesSets } from './useUserCapabilitiesSets';

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: jest.fn(),
  useStripes: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const data = {
  'totalRecords': 3,
  'capabilitySets': [
    {
      id: 'data-capability-id',
      name: 'capability_roles.manage',
      description: 'Manage Roles',
      resource: 'Capability Roles',
      action: 'manage',
      applicationId: 'app-platform-minimal-0.0.4',
      permissions: [
        'ui-role-capabilities.manage',
        'role-capabilities.collection.post',
        'role-capabilities.collection.get',
      ],
      type: 'data',
      metadata: {
        createdDate: '2023-07-14T15:32:15.56000:00',
        modifiedDate: '2023-07-14T15:32:15.561+00:00',
      },
    },
    {
      id: 'settings-capability-id',
      name: 'capability_roles.manage',
      description: 'Manage Roles',
      resource: 'Capability Roles',
      action: 'manage',
      applicationId: 'app-platform-minimal-0.0.4',
      permissions: [
        'ui-role-capabilities.manage',
        'role-capabilities.collection.post',
        'role-capabilities.collection.get',
      ],
      type: 'settings',
      metadata: {
        createdDate: '2023-07-14T15:32:15.560+00:00',
        modifiedDate: '2023-07-14T15:32:15.561+00:00',
      },
    },
    {
      id: 'procedural-capability-id',
      name: 'capability_roles.manage',
      description: 'Manage Roles',
      resource: 'Capability Roles',
      action: 'manage',
      applicationId: 'app-platform-minimal-0.0.4',
      permissions: [
        'ui-role-capabilities.manage',
        'role-capabilities.collection.post',
        'role-capabilities.collection.get',
      ],
      type: 'procedural',
      metadata: {
        createdDate: '2023-07-14T15:32:15.560+00:00',
        modifiedDate: '2023-07-14T15:32:15.561+00:00',
      },
    },
  ],
};

const expectedInitialRoleCapabilitySetsSelectedMap = {
  'data-capability-id': true,
  'settings-capability-id': true,
  'procedural-capability-id': true,
};

const expectedGroupedRoleCapabilitiesByType = {
  'data': [
    {
      'actions': {
        'manage': 'data-capability-id',
      },
      'applicationId': 'app-platform-minimal',
      'id': 'data-capability-id',
      'resource': 'Capability Roles',
    },
  ],
  'procedural': [
    {
      'actions': {
        'manage': 'procedural-capability-id',
      },
      'applicationId': 'app-platform-minimal',
      'id': 'procedural-capability-id',
      'resource': 'Capability Roles',
    },
  ],
  'settings': [
    {
      'actions': {
        'manage': 'settings-capability-id',
      },
      'applicationId': 'app-platform-minimal',
      'id': 'settings-capability-id',
      'resource': 'Capability Roles',
    },
  ],
};

describe('useRoleCapabilitySets', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  const mockGet = jest.fn(() => ({
    json: () => Promise.resolve(data),
  }));

  beforeEach(() => {
    queryClient.clear();
    mockGet.mockClear();
    useOkapiKy.mockClear().mockReturnValue({
      get: mockGet,
    });
    useStripes.mockClear().mockReturnValue({
      discovery: {
        applications: {
          'app-platform-minimal-0.0.4': 'app-platform-minimal',
        },
      },
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('fetches role capability sets', async () => {
    const { result } = renderHook(() => useUserCapabilitiesSets(1), { wrapper });

    await act(() => result.current.isSuccess);

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.initialUserCapabilitySetsSelectedMap).toBeDefined();
    expect(result.current.initialUserCapabilitySetsSelectedMap)
      .toStrictEqual(expectedInitialRoleCapabilitySetsSelectedMap);
    expect(result.current.capabilitySetsTotalCount).toEqual(3);
    expect(result.current.groupedUserCapabilitySetsByType).toEqual(expectedGroupedRoleCapabilitiesByType);
    expect(result.current.capabilitySetsAppIds).toEqual({ 'app-platform-minimal-0.0.4': true });
  });
});
