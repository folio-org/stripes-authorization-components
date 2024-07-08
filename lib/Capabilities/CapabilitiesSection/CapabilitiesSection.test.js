import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { CapabilitiesSection } from './CapabilitiesSection';

jest.mock('../CapabilitiesDataType', () => ({
  CapabilitiesDataType: () => <div>CapabilitiesDataType</div>,
}));
jest.mock('../CapabilitiesProcedural', () => ({
  CapabilitiesProcedural: () => <div>CapabilitiesProcedural</div>,
}));
jest.mock('../CapabilitiesSettings', () => ({
  CapabilitiesSettings: () => <div>CapabilitiesSettings</div>,
}));

const defaultProps = {
  capabilities: {
    data: [],
    settings: [],
    procedural: [],
  },
  readOnly: false,
  onChangeCapabilityCheckbox: jest.fn(),
  isCapabilitySelected: false,
  isCapabilityDisabled: false,
};
const renderComponent = (props = {}) => render(
  <CapabilitiesSection
    {...defaultProps}
    {...props}
  />,
);

describe('CapabilitiesSection', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should render nothing if there is no capabilities', () => {
    renderComponent();

    expect(screen.queryByText('CapabilitiesDataType')).not.toBeInTheDocument();
  });

  it('should render `CapabilitiesDataType`', () => {
    renderComponent({ capabilities: { data: ['data'] } });

    expect(screen.getByText('CapabilitiesDataType')).toBeInTheDocument();
  });

  it('should render `CapabilitiesDataType`, `CapabilitiesProcedural`, and `CapabilitiesSettings`', () => {
    renderComponent({
      capabilities: {
        data: ['data'],
        settings: ['settings'],
        procedural: ['procedural'],
      }
    });

    expect(screen.getByText('CapabilitiesDataType')).toBeInTheDocument();
    expect(screen.getByText('CapabilitiesSettings')).toBeInTheDocument();
    expect(screen.getByText('CapabilitiesProcedural')).toBeInTheDocument();
  });
});
