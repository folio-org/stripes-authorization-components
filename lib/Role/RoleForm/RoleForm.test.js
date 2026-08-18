import { FormattedMessage } from 'react-intl';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { mockPluggableOnClose } from '@folio/stripes/core';

import { RoleForm } from './RoleForm';

jest.mock('../../Capabilities', () => ({
  CapabilitiesAccordion: jest.fn(({
    onChangeCapabilityCheckbox,
    toggleCapabilitiesHeaderCheckbox,
  }) => (
    <div data-testid="capabilities-accordion">
      <button
        type="button"
        onClick={() => onChangeCapabilityCheckbox({ target: { checked: true } }, 'cap-3-view')}
      >
        check capability
      </button>
      <button
        type="button"
        onClick={() => toggleCapabilitiesHeaderCheckbox(true, 'data', 'view')}
      >
        check capabilities header
      </button>
    </div>
  )),
  CapabilitiesSetsAccordion: jest.fn(({
    onChangeCapabilitySetCheckbox,
    toggleCapabilitySetsHeaderCheckbox,
  }) => (
    <div data-testid="capability-sets-accordion">
      <button
        type="button"
        onClick={() => onChangeCapabilitySetCheckbox({ target: { checked: true } }, 'cap-set-1')}
      >
        check capability set
      </button>
      <button
        type="button"
        onClick={() => onChangeCapabilitySetCheckbox({ target: { checked: false } }, 'cap-set-1')}
      >
        uncheck capability set
      </button>
      <button
        type="button"
        onClick={() => toggleCapabilitySetsHeaderCheckbox(true, 'data', 'view')}
      >
        check capability sets header
      </button>
      <button
        type="button"
        onClick={() => toggleCapabilitySetsHeaderCheckbox(false, 'data', 'view')}
      >
        uncheck capability sets header
      </button>
    </div>
  )),
}));

const capabilitySetsList = [
  {
    id: 'cap-set-1',
    resource: 'Invoices',
    action: 'view',
    applicationId: 'app-1',
    capabilities: ['cap-1-view', 'cap-2-view'],
  },
  {
    id: 'cap-set-2',
    resource: 'Loans',
    action: 'manage',
    applicationId: 'app-1',
    capabilities: ['cap-3-view'],
  },
];

const capabilities = {
  data: [
    {
      id: 'cap-1',
      resource: 'Invoices',
      applicationId: 'app-1',
      actions: { view: 'cap-1-view' },
    },
    {
      id: 'cap-2',
      resource: 'Payments',
      applicationId: 'app-1',
      actions: { view: 'cap-2-view' },
    },
    {
      id: 'cap-3',
      resource: 'Loans',
      applicationId: 'app-1',
      actions: { view: 'cap-3-view' },
    },
  ],
  procedural: [],
  settings: [],
};

const defaultProps = {
  title: 'stripes-authorization-components.crud.createRole',
  roleName: 'Circulation staff',
  description: 'Can manage circulation tasks',
  capabilities,
  isCapabilitySelected: jest.fn(),
  isLoading: false,
  setRoleName: jest.fn(),
  setDescription: jest.fn(),
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  onChangeCapabilityCheckbox: jest.fn(),
  selectedCapabilitiesMap: { 'cap-1-view': true },
  onSaveSelectedApplications: jest.fn(),
  checkedAppIdsMap: { 'app-1': true },
  capabilitySets: { data: capabilitySetsList, procedural: [], settings: [] },
  capabilitySetsList,
  actionCapabilitySets: {
    data: { view: ['cap-set-1', 'cap-set-2'] },
    procedural: {},
    settings: {},
  },
  isCapabilitySetSelected: jest.fn(),
  onChangeCapabilitySetCheckbox: jest.fn(),
  isCapabilityDisabled: jest.fn(),
  isCapabilitiesLoading: false,
  isCapabilitySetsLoading: false,
  unselectAllCapabilitiesAndSets: jest.fn(),
  toggleCapabilitiesHeaderCheckbox: jest.fn(),
  isAllActionCapabilitiesSelected: jest.fn(),
  toggleCapabilitySetsHeaderCheckbox: jest.fn(),
  isAllActionCapabilitySetsSelected: jest.fn(),
  isUnselectApplicationConfirmationOpen: false,
  setIsUnselectApplicationConfirmationOpen: jest.fn(),
  unselectedItemsInfo: undefined,
  applyAppIdsChanges: jest.fn(),
};

const renderComponent = (props = {}) => render(
  <RoleForm
    {...defaultProps}
    {...props}
  />
);

// SessionConfirmationModal renders the real (unmocked) ConfirmationModal/Modal internally, so its
// `message` prop (a <FormattedMessage />) can't be inspected via a mocked ConfirmationModal. Instead,
// pull the values passed to the mocked `FormattedMessage` for a given translation id.
const getFormattedMessageProps = (id) => {
  const matchingCalls = FormattedMessage.mock.calls.filter(([props]) => props.id === id);

  return matchingCalls[matchingCalls.length - 1][0];
};

describe('RoleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPluggableOnClose.mockClear();
    sessionStorage.clear();
  });

  it('renders the form with editable role information and footer actions', async () => {
    renderComponent();

    expect(screen.getByTestId('create-role-form')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    expect(screen.getByTestId('rolename-input')).toHaveValue(defaultProps.roleName);
    expect(screen.getByTestId('description-input')).toHaveValue(defaultProps.description);
    expect(screen.getByRole('button', { name: 'stripes-components.saveAndClose' })).toBeEnabled();

    fireEvent.change(screen.getByTestId('rolename-input'), {
      target: { value: 'Updated role name' },
    });
    fireEvent.blur(screen.getByTestId('description-input'), {
      target: { value: 'Updated description' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'stripes-authorization-components.crud.cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'stripes-components.saveAndClose' }));

    expect(defaultProps.setRoleName).toHaveBeenCalledWith('Updated role name');
    expect(defaultProps.setDescription).toHaveBeenCalledWith('Updated description');
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables save when role name is empty or the form is loading', () => {
    const { rerender } = renderComponent({ roleName: '' });

    expect(screen.getByRole('button', { name: 'stripes-components.saveAndClose' })).toBeDisabled();

    rerender(<RoleForm {...defaultProps} isLoading />);

    expect(screen.getByRole('button', { name: 'stripes-components.saveAndClose' })).toBeDisabled();
  });

  it('wires the application pluggable trigger and unassign-all action', async () => {
    renderComponent();

    await userEvent.click(screen.getByTestId('select-application-trigger'));
    await userEvent.click(screen.getByRole('button', {
      name: 'stripes-authorization-components.form.unassignAllCapabilities',
    }));

    expect(defaultProps.onSaveSelectedApplications).toHaveBeenCalledWith(
      defaultProps.checkedAppIdsMap,
      mockPluggableOnClose,
    );
    expect(defaultProps.unselectAllCapabilitiesAndSets).toHaveBeenCalledTimes(1);
  });

  it('confirms unselecting applications before applying app id changes', async () => {
    const onCloseHandler = jest.fn();
    const selectedAppIds = { 'app-2': true };

    renderComponent({
      isUnselectApplicationConfirmationOpen: true,
      unselectedItemsInfo: {
        onCloseHandler,
        selectedAppIds,
        unselectedAppIds: ['app-1'],
        unselectedCapabilityCount: 2,
        unselectedCapabilitySetCount: 1,
      },
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getFormattedMessageProps('stripes-authorization-components.applications.unselect.warning').values).toEqual({
      appNames: 'app-1',
      capabilitiesCount: 2,
      capabilitySetsCount: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.continue' }));

    expect(defaultProps.setIsUnselectApplicationConfirmationOpen).toHaveBeenCalledWith(false);
    expect(onCloseHandler).toHaveBeenCalledTimes(1);
    expect(defaultProps.applyAppIdsChanges).toHaveBeenCalledWith(selectedAppIds);
  });

  it('closes the application confirmation without applying changes when canceled', async () => {
    renderComponent({
      isUnselectApplicationConfirmationOpen: true,
      unselectedItemsInfo: {
        onCloseHandler: jest.fn(),
        selectedAppIds: { 'app-2': true },
        unselectedAppIds: ['app-1'],
        unselectedCapabilityCount: 2,
        unselectedCapabilitySetCount: 1,
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'stripes-components.cancel' }));

    expect(defaultProps.setIsUnselectApplicationConfirmationOpen).toHaveBeenCalledWith(false);
    expect(defaultProps.applyAppIdsChanges).not.toHaveBeenCalled();
  });

  it('checks a capability set immediately without confirmation', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'check capability set' }));

    expect(defaultProps.onChangeCapabilitySetCheckbox).toHaveBeenCalledWith(true, 'cap-set-1');
  });

  it('asks for confirmation before unchecking one capability set', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'uncheck capability set' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getFormattedMessageProps('stripes-authorization-components.capabilitySets.unselect.warning').values).toEqual({
      capabilitySet: 'Invoices - view',
      capabilitiesCount: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.continue' }));

    expect(defaultProps.onChangeCapabilitySetCheckbox).toHaveBeenCalledWith(false, 'cap-set-1');
    expect(defaultProps.toggleCapabilitySetsHeaderCheckbox).not.toHaveBeenCalled();
  });

  it('does not show the confirmation modal again after checking "do not display this message again" and confirming', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'uncheck capability set' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: 'ConfirmationModal.suppressLabel' }));
    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.continue' }));

    expect(defaultProps.onChangeCapabilitySetCheckbox).toHaveBeenCalledWith(false, 'cap-set-1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    defaultProps.onChangeCapabilitySetCheckbox.mockClear();

    // Performing the same action again should confirm automatically, without showing the modal.
    await userEvent.click(screen.getByRole('button', { name: 'uncheck capability set' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(defaultProps.onChangeCapabilitySetCheckbox).toHaveBeenCalledWith(false, 'cap-set-1');
  });

  it('checks capability set headers immediately without confirmation', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'check capability sets header' }));

    expect(defaultProps.toggleCapabilitySetsHeaderCheckbox).toHaveBeenCalledWith(true, 'data', 'view');
  });

  it('asks for confirmation before unchecking capability set headers', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'uncheck capability sets header' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getFormattedMessageProps('stripes-authorization-components.capabilitySets.unselect.warning').values).toEqual({
      capabilitySet: 'Invoices - view, Loans - manage',
      capabilitiesCount: 2,
    });

    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.continue' }));

    expect(defaultProps.toggleCapabilitySetsHeaderCheckbox).toHaveBeenCalledWith(false, 'data', 'view');
    expect(defaultProps.onChangeCapabilitySetCheckbox).not.toHaveBeenCalled();
  });

  it('passes capability checkbox and header actions through to the capabilities accordion', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'check capability' }));
    await userEvent.click(screen.getByRole('button', { name: 'check capabilities header' }));

    expect(defaultProps.onChangeCapabilityCheckbox).toHaveBeenCalledWith(
      { target: { checked: true } },
      'cap-3-view',
    );
    expect(defaultProps.toggleCapabilitiesHeaderCheckbox).toHaveBeenCalledWith(true, 'data', 'view');
  });
});
