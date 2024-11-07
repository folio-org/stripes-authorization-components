import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { CapabilitiesSettings } from './CapabilitiesSettings';

const settingsTypeCapabilities = [
  {
    id: '8d2da27c-1d56-48b6-9534218d-2bfae6d79dc8',
    applicationId: 'Inventory-2.0',
    name: 'foo_item.delete',
    description: 'Settings: Delete foo item',
    resource: 'Settings source',
    action: 'edit',
    type: 'settings',
    permissions: ['foo.item.post'],
    actions: { view: 'view-id', edit: 'edit-id', create: 'create-id', delete: 'delete-id', manage: 'manage-id' },
  },
];

const renderComponent = (data, onChange) => render(
  <CapabilitiesSettings
    content={data}
    isCapabilitySelected={jest.fn().mockReturnValue(true)}
    onChangeCapabilityCheckbox={onChange}
  />,
);

describe('CapabilitiesSettings', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('renders fields in the grid', () => {
    renderComponent(settingsTypeCapabilities, jest.fn());

    expect(screen.getByText(settingsTypeCapabilities[0].applicationId)).toBeInTheDocument();
    expect(screen.getByText(settingsTypeCapabilities[0].resource)).toBeInTheDocument();
  });

  it('renders checkboxes', async () => {
    const mockChangeHandler = jest.fn().mockReturnValue(true);

    renderComponent(settingsTypeCapabilities, mockChangeHandler);

    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();

    await userEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(mockChangeHandler).toHaveBeenCalled();
  });

  it('renders null if action name is not compatible with view, edit, create, delete, manage actions', async () => {
    const mockChangeHandler = jest.fn().mockReturnValue(true);

    renderComponent([{ ...settingsTypeCapabilities[0], actions: { execute: 'execute-id' } }], mockChangeHandler);

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
