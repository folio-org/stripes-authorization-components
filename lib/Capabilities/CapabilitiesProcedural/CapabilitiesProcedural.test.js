import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { CapabilitiesProcedural } from './CapabilitiesProcedural';

const proceduralTypeCapabilities = [
  {
    id: '8d2da27c-1d56-48b6-958d-2bfae6d7922dc8',
    applicationId: 'Fees/fines-22.3',
    name: 'foo_item.delete',
    description: 'Login: Delete foo item',
    resource: 'Settings source',
    action: 'execute',
    type: 'procedural',
    permissions: ['foo.item.post'],
    actions: { execute: 'execute-id' },
  },
];

const renderComponent = (data, onChange) => render(
  <CapabilitiesProcedural
    content={data}
    isCapabilitySelected={jest.fn().mockReturnValue(true)}
    onChangeCapabilityCheckbox={onChange}
  />,
);

describe('Procedural capabilities type', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  it('renders fields in the grid', () => {
    const mockChangeHandler = jest.fn();

    renderComponent(proceduralTypeCapabilities, mockChangeHandler);

    expect(screen.getByText('Settings source')).toBeInTheDocument();
    expect(screen.getByText('Fees/fines')).toBeInTheDocument();
  });

  it('renders checkboxes', async () => {
    const mockChangeHandler = jest.fn().mockReturnValue(true);

    renderComponent(proceduralTypeCapabilities, mockChangeHandler);

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();

    await userEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(mockChangeHandler).toHaveBeenCalled();
  });

  it('renders null if action name is not execute', async () => {
    const mockChangeHandler = jest.fn().mockReturnValue(true);

    renderComponent([{ ...proceduralTypeCapabilities[0], actions: { view: 'view-id' } }], mockChangeHandler);

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
