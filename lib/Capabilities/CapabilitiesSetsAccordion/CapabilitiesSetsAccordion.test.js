import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { CapabilitiesSetsAccordion } from './CapabilitiesSetsAccordion';

const renderComponent = (props = {}) => render(<CapabilitiesSetsAccordion {...props} />);

describe('CapabilitiesSetsAccordion', () => {
  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const props = {
      isCapabilitySetSelected: jest.fn(),
      onChangeCapabilitySetCheckbox: jest.fn(),
      capabilitySets: {},
      isLoading: false,
      toggleCapabilitySetsHeaderCheckbox: jest.fn(),
      isAllActionCapabilitySetsSelected: jest.fn(),
    };

    const { container } = renderComponent(props);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
