import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@folio/jest-config-stripes/testing-library/react';
import { CapabilitiesSection } from './CapabilitiesSection';

const renderComponent = (props = {}) => render(<CapabilitiesSection {...props} />);

describe('CapabilitiesSection', () => {
  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const props = {
      readOnly: false,
      isCapabilitySelected: jest.fn(),
      onChangeCapabilityCheckbox: jest.fn(),
      capabilities: {},
      toggleCapabilitiesHeaderCheckbox: jest.fn(),
      isAllActionCapabilitiesSelected: jest.fn(),
    };

    const { container } = renderComponent(props);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
