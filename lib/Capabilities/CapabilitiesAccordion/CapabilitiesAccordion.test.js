import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { CapabilitiesAccordion } from './CapabilitiesAccordion';

const renderComponent = (props = {}) => render(<CapabilitiesAccordion {...props} />);

describe('CapabilitiesAccordion', () => {
  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const props = {
      isCapabilitySelected: jest.fn(),
      onChangeCapabilityCheckbox: jest.fn(),
      selectedCapabilitiesMap: {},
      isCapabilityDisabled: jest.fn(),
      capabilities: {},
      isLoading: false,
      toggleCapabilitiesHeaderCheckbox: jest.fn(),
      isAllActionCapabilitiesSelected: jest.fn(),
    };

    const { container } = renderComponent(props);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
