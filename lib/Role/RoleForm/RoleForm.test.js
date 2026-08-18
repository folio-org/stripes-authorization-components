import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { ConfirmationModal } from '@folio/stripes/components';
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
  showHidden: false,
  setShowHidden: jest.fn(),
};

const renderComponent = (props = {}) => render(
  <RoleForm
    {...defaultProps}
    {...props}
  />
);

const getConfirmationModalProps = (id) => {
  const matchingCalls = ConfirmationModal.mock.calls.filter(([props]) => props.id === id);

  return matchingCalls[matchingCalls.length - 1][0];
};

describe('RoleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPluggableOnClose.mockClear();
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

  it('shows a required-field error and disables save when the name is blurred while empty', () => {
    renderComponent({ roleName: '' });

    fireEvent.blur(screen.getByTestId('rolename-input'));

    expect(screen.getByText('stripes-core.label.missingRequiredField')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'stripes-components.saveAndClose' })).toBeDisabled();
  });

  it('shows an invalid-character error and disables save when the name contains a "/"', () => {
    renderComponent({ roleName: 'circ/staff' });

    expect(screen.getByText('stripes-authorization-components.form.errors.name.invalidCharacter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'stripes-components.saveAndClose' })).toBeDisabled();
  });

  it('does not call onSubmit when the form is submitted with an invalid name', () => {
    renderComponent({ roleName: 'circ/staff' });

    fireEvent.submit(screen.getByTestId('create-role-form'));

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
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

    const modalProps = getConfirmationModalProps('unselect-application-confirmation-modal');

    expect(modalProps.open).toBe(true);
    expect(modalProps.message.props.values).toEqual({
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

    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));

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

    const modalProps = getConfirmationModalProps('unselect-capability-set-confirmation-modal');

    expect(modalProps.open).toBe(true);
    expect(modalProps.message.props.values).toEqual({
      capabilitySet: 'Invoices - view',
      capabilitiesCount: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: 'stripes-core.button.continue' }));

    expect(defaultProps.onChangeCapabilitySetCheckbox).toHaveBeenCalledWith(false, 'cap-set-1');
    expect(defaultProps.toggleCapabilitySetsHeaderCheckbox).not.toHaveBeenCalled();
  });

  it('checks capability set headers immediately without confirmation', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'check capability sets header' }));

    expect(defaultProps.toggleCapabilitySetsHeaderCheckbox).toHaveBeenCalledWith(true, 'data', 'view');
  });

  it('asks for confirmation before unchecking capability set headers', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'uncheck capability sets header' }));

    const modalProps = getConfirmationModalProps('unselect-capability-set-confirmation-modal');

    expect(modalProps.open).toBe(true);
    expect(modalProps.message.props.values).toEqual({
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

  describe('show hidden capabilities checkbox', () => {
    const getShowHiddenCheckbox = () => screen.getByRole('checkbox', {
      name: 'stripes-authorization-components.form.labels.showHidden',
    });

    it('renders unchecked when showHidden is false and calls setShowHidden on click', async () => {
      renderComponent();

      const checkbox = getShowHiddenCheckbox();

      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);

      expect(defaultProps.setShowHidden).toHaveBeenCalledWith(true);
    });

    it('renders checked when showHidden is true', () => {
      renderComponent({ showHidden: true });

      expect(getShowHiddenCheckbox()).toBeChecked();
    });

    it('is disabled while the form is loading', () => {
      renderComponent({ isLoading: true });

      expect(getShowHiddenCheckbox()).toBeDisabled();
    });

    it('is disabled when there are no capabilities of any type', () => {
      renderComponent({ capabilities: { data: [], procedural: [], settings: [] } });

      expect(getShowHiddenCheckbox()).toBeDisabled();
    });

    it('is enabled when at least one capability type has entries', () => {
      renderComponent();

      expect(getShowHiddenCheckbox()).toBeEnabled();
    });
  });
});
