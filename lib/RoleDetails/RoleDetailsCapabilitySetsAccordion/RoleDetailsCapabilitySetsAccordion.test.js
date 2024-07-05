import { render } from '@folio/jest-config-stripes/testing-library/react';

import { renderWithRouter } from 'helpers';
import { useRoleCapabilitySets } from '../../hooks';
import { RoleDetailsCapabilitySetsAccordion } from './RoleDetailsCapabilitySetsAccordion';

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useRoleCapabilitySets: jest.fn(),
}));
jest.mock('../../Capabilities', () => ({
  CapabilitiesSection: () => <div>CapabilitiesSection</div>,
}));

const capCount = 2147483647;

const renderComponent = () => render(
  renderWithRouter(
    <RoleDetailsCapabilitySetsAccordion roleId="1" />
  )
);

describe('RoleDetailsCapabilitySetsAccordion', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('displays accordion', () => {
    useRoleCapabilitySets.mockReturnValue({
      capabilitySetsTotalCount: capCount,
      isSuccess: true,
    });

    const { getByText } = renderComponent();

    it('render accordion header', () => {
      getByText('stripes-authorization-components.details.capabilitySets');
      getByText(capCount);
    });
  });

  it('render loading spinner', () => {
    useRoleCapabilitySets.mockReturnValue({
      capabilitiesTotalCount: capCount,
      isSuccess: false,
    });

    const { getByText } = renderComponent();

    getByText('Loading');
  });
});
