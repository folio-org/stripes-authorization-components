import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import {
  render,
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { CalloutContext } from '@folio/stripes/core';

import { ROLE_TYPE } from '../constants';
import {
  useDeleteRoleMutation,
  useInitialRoleSharing,
  useRoleById,
  useRoleCapabilities,
  useRoleCapabilitySets,
  useRoleSharing,
} from '../hooks';
import { getCapabilitiesGroupedByTypeAndResource, isTenantConsortiumCentral } from '../utils';
import { RoleDetails } from './RoleDetails';

const mockHistoryPushFn = jest.fn();
const path = '/auz-rolez/';

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useDeleteRoleMutation: jest.fn(),
  useInitialRoleSharing: jest.fn(),
  useRoleById: jest.fn(),
  useRoleCapabilities: jest.fn(),
  useRoleCapabilitySets: jest.fn(),
  useRoleSharing: jest.fn(),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  isTenantConsortiumCentral: jest.fn(),
}));

jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
    useHistory: jest.fn(() => ({ push: mockHistoryPushFn, location: { search: '' } })),
  };
});

const getRoleData = (data) => ({
  id: '2efe1d13-eff9-4b01-a2fe-512e9d5239c7',
  name: 'demo test role',
  description: 'simple description',
  metadata: {
    createdDate: '2023-03-14T12:07:17.594+00:00',
    createdBy: 'db3bcf41-767f-4a4a-803d-bd5a41ace9b1',
    modifiedDate: '2023-03-14T12:07:17.594+00:00',
  },
  capabilities: ['setting-capability-id'],
  type: ROLE_TYPE.regular,
  ...data,
});

const defaultProps = {
  roleId: '2efe1d13-eff9-4b01-a2fe-512e9d5239c7',
  path,
};

const sendCallout = jest.fn();
const history = createMemoryHistory();

const renderComponent = (props = {}) => render(

  <Router history={history}>
    <CalloutContext.Provider value={{ sendCallout }}>
      <RoleDetails
        {...defaultProps}
        {...props}
      />
    </CalloutContext.Provider>
  </Router>
);

const mockMutateDeleteRole = jest.fn();

useRoleById.mockReturnValue({ roleDetails: getRoleData(), isRoleDetailsLoaded: true });
useDeleteRoleMutation.mockReturnValue({ mutateAsync: mockMutateDeleteRole });
// RoleDetailsCapabilitiesAccordion/RoleDetailsCapabilitySetsAccordion are left unmocked (see below)
// so that the visibility-filtering tests can assert on what actually renders in the DOM.
useRoleCapabilities.mockReturnValue({
  initialRoleCapabilitiesSelectedMap: {},
  isSuccess: true,
  isFetching: false,
  capabilitiesTotalCount: 0,
  groupedRoleCapabilitiesByType: { data: [], procedural: [], settings: [] },
  capabilitiesAppIds: {},
});
useRoleCapabilitySets.mockReturnValue({
  initialRoleCapabilitySetsSelectedMap: {},
  isSuccess: true,
  isFetching: false,
  capabilitySetsTotalCount: 0,
  groupedRoleCapabilitySetsByType: { data: [], procedural: [], settings: [] },
  capabilitySetsCapabilities: {},
  capabilitySetsAppIds: {},
});
jest.mock('./RoleDetailsUsersAccordion', () => ({
  RoleDetailsUsersAccordion: () => <div>Accordion users</div>,
}));

describe('RoleDetails component', () => {
  const deleteSharedRole = jest.fn(() => Promise.resolve());
  const shareRole = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    shareRole.mockClear();
    deleteSharedRole.mockClear();

    useInitialRoleSharing
      .mockClear()
      .mockReturnValue({ shareRole });
    useRoleSharing
      .mockClear()
      .mockReturnValue({ deleteSharedRole });
  });

  describe('renders roles details pane with expanded information', () => {
    it('render expanded role info by default', () => {
      const { getByText } = renderComponent();
      getByText('stripes-authorization-components.details.capabilities');
      getByText('stripes-authorization-components.details.capabilitySets');
      getByText('Accordion users');
    });

    it('test confirm delete action', async () => {
      const { getByRole, getByText } = renderComponent();

      await userEvent.click(getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));
      await userEvent.click(getByRole('button', { name: 'stripes-authorization-components.crud.delete' }));
      await userEvent.click(
        within(getByText('stripes-authorization-components.crud.deleteRole'))
          .getByRole('button', { name: 'confirm' })
      );

      expect(mockMutateDeleteRole).toHaveBeenCalledWith('2efe1d13-eff9-4b01-a2fe-512e9d5239c7');
    });

    it('test cancel delete action', async () => {
      const { getByRole, getByText } = renderComponent();

      await userEvent.click(getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));
      await userEvent.click(getByRole('button', { name: 'stripes-authorization-components.crud.delete' }));
      await userEvent.click(
        within(getByText('stripes-authorization-components.crud.deleteRole'))
          .getByRole('button', { name: 'cancel' })
      );
    });

    it('calls onClose function on close details button', async () => {
      renderComponent();
      const closeButton = document.querySelector('[data-test-pane-header-dismiss-button]');
      await userEvent.click(closeButton);

      expect(mockHistoryPushFn).toHaveBeenCalledWith(path);
    });

    it('calls edit function on click dropdown edit button', async () => {
      const { getByText } = renderComponent();

      await userEvent.click(getByText('stripes-authorization-components.crud.edit'));
      expect(mockHistoryPushFn).toHaveBeenCalledWith(path + '/2efe1d13-eff9-4b01-a2fe-512e9d5239c7/edit');
    });
  });

  describe('capabilities and capability sets visibility filtering', () => {
    const visibleCapability = {
      id: 'cap-visible',
      name: 'visible_resource.view',
      resource: 'Visible Resource',
      action: 'view',
      applicationId: 'app-1',
      type: 'data',
      visible: true,
    };
    const hiddenCapability = {
      id: 'cap-hidden',
      name: 'hidden_resource.view',
      resource: 'Hidden Resource',
      action: 'view',
      applicationId: 'app-1',
      type: 'data',
      visible: false,
    };
    const visibleCapabilitySet = {
      id: 'cap-set-visible',
      name: 'visible_set.view',
      resource: 'Visible Resource Set',
      action: 'view',
      applicationId: 'app-1',
      type: 'data',
      visible: true,
    };
    const hiddenCapabilitySet = {
      id: 'cap-set-hidden',
      name: 'hidden_set.view',
      resource: 'Hidden Resource Set',
      action: 'view',
      applicationId: 'app-1',
      type: 'data',
      visible: false,
    };

    beforeEach(() => {
      // Mirror the real hooks' behavior of filtering the raw capabilities/sets by the
      // predicate (isCapabilityVisible, hardcoded by the read-only accordions) before
      // grouping them for display, so the test observes the effect on what's actually
      // rendered rather than asserting on the predicate itself.
      useRoleCapabilities.mockImplementation((_roleId, _tenant, _expand, _options, filter = () => true) => {
        const filtered = [visibleCapability, hiddenCapability].filter(filter);

        return {
          initialRoleCapabilitiesSelectedMap: {},
          isSuccess: true,
          isFetching: false,
          capabilitiesTotalCount: filtered.length,
          groupedRoleCapabilitiesByType: getCapabilitiesGroupedByTypeAndResource(filtered),
          capabilitiesAppIds: {},
        };
      });

      useRoleCapabilitySets.mockImplementation((_roleId, _tenant, _options, filter = () => true) => {
        const filtered = [visibleCapabilitySet, hiddenCapabilitySet].filter(filter);

        return {
          initialRoleCapabilitySetsSelectedMap: {},
          isSuccess: true,
          isFetching: false,
          capabilitySetsTotalCount: filtered.length,
          groupedRoleCapabilitySetsByType: getCapabilitiesGroupedByTypeAndResource(filtered),
          capabilitySetsCapabilities: {},
          capabilitySetsAppIds: {},
        };
      });
    });

    it('renders capabilities and capability sets that are visible, and omits those marked visible: false', () => {
      const { getByText, queryByText } = renderComponent();

      expect(getByText('Visible Resource')).toBeInTheDocument();
      expect(queryByText('Hidden Resource')).not.toBeInTheDocument();
      expect(getByText('Visible Resource Set')).toBeInTheDocument();
      expect(queryByText('Hidden Resource Set')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle role delete error', async () => {
      const error = new Error('delete fail');

      useDeleteRoleMutation.mockReturnValue({ mutateAsync: jest.fn(() => Promise.reject(error)) });

      const { getByText, getByRole } = renderComponent();

      await userEvent.click(getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));
      await userEvent.click(getByRole('button', { name: 'stripes-authorization-components.crud.delete' }));
      await userEvent.click(
        within(getByText('stripes-authorization-components.crud.deleteRole'))
          .getByRole('button', { name: 'confirm' })
      );

      expect(sendCallout).toHaveBeenCalled();
    });
  });

  describe('ECS mode', () => {
    beforeEach(() => {
      isTenantConsortiumCentral
        .mockClear()
        .mockReturnValue(true);
      useRoleById
        .mockClear()
        .mockReturnValue({ roleDetails: getRoleData({ type: ROLE_TYPE.consortium }) });
    });

    it('should handle policy sharing when "Share to all" action is performed', async () => {
      useRoleById.mockReturnValue({ roleDetails: getRoleData({ type: ROLE_TYPE.regular }) });

      renderComponent({ displayShareAction: true });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));
      await userEvent.click(screen.getByText('stripes-authorization-components.shareToAll'));
      await userEvent.click(
        within(screen.getByText('ui-consortia-settings.consortiumManager.modal.confirmShare.all.heading'))
          .getByRole('button', { name: 'confirm' })
      );

      expect(shareRole).toHaveBeenCalled();
    });

    it('should prevent mutations for shared role in the member tenants', async () => {
      isTenantConsortiumCentral.mockReturnValue(false);

      renderComponent({ displayShareAction: true });

      expect(screen.queryByText('stripes-authorization-components.crud.edit')).not.toBeInTheDocument();
    });

    it('should prevent mutations for shared role outside consortium manager', async () => {
      isTenantConsortiumCentral.mockReturnValue(true);

      renderComponent({ displayShareAction: true });

      expect(screen.queryByText('stripes-authorization-components.crud.edit')).not.toBeInTheDocument();
    });

    it('should handle shared policy delete', async () => {
      useRoleById
        .mockClear()
        .mockReturnValue({
          roleDetails: { ...getRoleData(), type: 'CONSORTIUM' },
          isRoleDetailsLoaded: true,
        });

      history.replace('/consortia');

      renderComponent({ displayShareAction: true });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));
      await userEvent.click(screen.getByRole('button', { name: 'stripes-authorization-components.crud.delete' }));
      await userEvent.click(
        within(screen.getByText('stripes-authorization-components.crud.deleteRole'))
          .getByRole('button', { name: 'confirm' })
      );

      expect(deleteSharedRole).toHaveBeenCalled();
    });
  });

  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const { container } = renderComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  describe('RoleDetails permissions (canEdit / canDelete / canShare)', () => {
    it('should hide edit button if canEdit is false', () => {
      renderComponent({ canEdit: false });

      expect(screen.queryByText('stripes-authorization-components.crud.edit')).not.toBeInTheDocument();
    });

    it('should show edit button if canEdit is true', () => {
      renderComponent({ canEdit: true });

      expect(screen.getByText('stripes-authorization-components.crud.edit')).toBeInTheDocument();
    });

    it('should hide delete button if canDelete is false', async () => {
      renderComponent({ canDelete: false });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));

      expect(screen.queryByRole('button', { name: 'stripes-authorization-components.crud.delete' })).not.toBeInTheDocument();
    });

    it('should show delete button if canDelete is true', async () => {
      renderComponent({ canDelete: true });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));

      expect(screen.getByRole('button', { name: 'stripes-authorization-components.crud.delete' })).toBeInTheDocument();
    });

    it('should hide duplicate button if canCreate is false', async () => {
      renderComponent({ canCreate: false });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));

      expect(screen.queryByText('stripes-authorization-components.crud.duplicate')).not.toBeInTheDocument();
    });

    it('should show duplicate button if canCreate is true', async () => {
      renderComponent({ canCreate: true });

      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.paneMenuActionsToggleLabel' }));

      expect(screen.getByText('stripes-authorization-components.crud.duplicate')).toBeInTheDocument();
    });

    it('should hide edit and delete buttons, but show duplicate button if role is default', () => {
      useRoleById.mockReturnValueOnce({
        roleDetails: { ...defaultProps, ...getRoleData({ type: ROLE_TYPE.default }) },
        isRoleDetailsLoaded: true,
      });

      renderComponent({ canEdit: true });

      expect(screen.queryByText('stripes-authorization-components.crud.edit')).not.toBeInTheDocument();
      expect(screen.queryByText('stripes-authorization-components.crud.delete')).not.toBeInTheDocument();
      expect(screen.queryByText('stripes-authorization-components.crud.duplicate')).toBeInTheDocument();
    });
  });
});
