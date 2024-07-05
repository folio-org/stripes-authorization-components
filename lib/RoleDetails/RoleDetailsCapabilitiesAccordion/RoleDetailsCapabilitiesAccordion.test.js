import { render } from '@folio/jest-config-stripes/testing-library/react';

import { renderWithRouter } from 'helpers';
import { useRoleCapabilities } from '../../hooks';
import { RoleDetailsCapabilitiesAccordion } from './RoleDetailsCapabilitiesAccordion';

jest.mock('../../Capabilities', () => ({
  CapabilitiesSection: () => <div>CapabilitiesSection</div>,
}));
jest.mock('../../hooks', () => ({
  useRoleCapabilities: jest.fn(),
}));

const capCount = 2147483647;

const renderComponent = () => render(
  renderWithRouter(
    <RoleDetailsCapabilitiesAccordion roleId="1" />
  )
);

describe('RoleDetailsCapabilitiesAccordion', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('displays accordion', () => {
    useRoleCapabilities.mockReturnValue({
      capabilitiesTotalCount: capCount,
      isSuccess: true,
    });

    const { getByText } = renderComponent();

    it('render accordion header', () => {
      getByText('stripes-authorization-components.details.capabilities');
      getByText(capCount);
    });
  });

  it('render loading spinner', () => {
    useRoleCapabilities.mockReturnValue({
      capabilitiesTotalCount: capCount,
      isSuccess: false,
    });

    const { getByText } = renderComponent();

    getByText('Loading');
  });
});
