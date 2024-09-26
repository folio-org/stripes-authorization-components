import {
  render,
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { renderWithRouter } from 'helpers';
import {
  useDeleteRoleMutation,
  useInitialRoleSharing,
  useRoleById,
  useRoleSharing,
} from '../hooks';
import { isTenantConsortiumCentral } from '../utils';
import { RoleDetails } from './RoleDetails';

const mockHistoryPushFn = jest.fn();
const path = '/auz-rolez/';

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useDeleteRoleMutation: jest.fn(),
  useInitialRoleSharing: jest.fn(),
  useRoleById: jest.fn(),
  useRoleSharing: jest.fn(),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  isTenantConsortiumCentral: jest.fn(),
}));

jest.mock('react-router', () => {
  return {
    ...jest.requireActual('react-router'),
    useHistory: jest.fn(() => ({ push: mockHistoryPushFn, location: { search: '' } }))
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
  ...data,
});

const defaultProps = {
  roleId: '2efe1d13-eff9-4b01-a2fe-512e9d5239c7',
  path,
};

const renderComponent = (props = {}) => render(
  renderWithRouter(
    <RoleDetails
      {...defaultProps}
      {...props}
    />
  )
);

const mockMutateDeleteRole = jest.fn();

useRoleById.mockReturnValue({ roleDetails: getRoleData(), isRoleDetailsLoaded: true });
useDeleteRoleMutation.mockReturnValue({ mutateAsync: mockMutateDeleteRole });
jest.mock('./RoleDetailsCapabilitiesAccordion', () => ({
  RoleDetailsCapabilitiesAccordion: () => <div>Accordion capabilities</div>,
}));
jest.mock('./RoleDetailsUsersAccordion', () => ({
  RoleDetailsUsersAccordion: () => <div>Accordion users</div>,
}));
jest.mock('./RoleDetailsCapabilitySetsAccordion', () => ({
  RoleDetailsCapabilitySetsAccordion: () => <div>Accordion capability sets</div>,
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
      getByText('Accordion capabilities');
      getByText('Accordion capability sets');
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

  describe('ECS mode', () => {
    beforeEach(() => {
      isTenantConsortiumCentral
        .mockClear()
        .mockReturnValue(true);
    });

    it('should handle policy sharing when "Share to all" action is performed', async () => {
      isTenantConsortiumCentral.mockReturnValue(true);

      renderComponent({ displayShareAction: true });

      await userEvent.click(screen.getByText('stripes-authorization-components.shareToAll'));
      await userEvent.click(
        within(screen.getByText('ui-consortia-settings.consortiumManager.modal.confirmShare.all.heading'))
          .getByRole('button', { name: 'confirm' })
      );

      expect(shareRole).toHaveBeenCalled();
    });

    it('should handle shared policy delete', async () => {
      useRoleById
        .mockClear()
        .mockReturnValue({
          roleDetails: { ...getRoleData(), type: 'CONSORTIUM' },
          isRoleDetailsLoaded: true,
        });

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
});
