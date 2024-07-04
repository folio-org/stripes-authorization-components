import { cleanup, render } from '@folio/jest-config-stripes/testing-library/react';
import '@folio/jest-config-stripes/testing-library/jest-dom';
import { useRoleCapabilitySets } from '@folio/stripes-authorization-components';

import renderWithRouter from '../../../test/jest/helpers/renderWithRouter';
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
  afterEach(() => {
    cleanup();
  });

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
