import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { usePolicySharing } from '../../hooks';
import { isTenantConsortiumCentral } from '../../utils';
import PolicyDetails from './PolicyDetails';

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  usePolicySharing: jest.fn(),
}));
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  isTenantConsortiumCentral: jest.fn(),
}));

const onClose = jest.fn();

const getPolicyData = (data) => ({
  id: '2efe1d13-eff9-4b01-a2fe-512e9d5239c7',
  name: 'demo policy',
  description: 'simple description',
  metadata: {
    createdDate: '2023-03-14T12:07:17.594+00:00',
    createdBy: 'db3bcf41-767f-4a4a-803d-bd5a41ace9b1',
    modifiedDate: '2023-03-14T12:07:17.594+00:00',
  },
  ...data,
});

const defaultProps = {
  policy: getPolicyData(),
  onClose,
  onEdit: jest.fn(),
};

const renderComponent = (props = {}) => render(
  <PolicyDetails
    {...defaultProps}
    {...props}
  />
);

describe('PolicyDetails component', () => {
  const upsertSharedPolicy = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    upsertSharedPolicy.mockClear();

    usePolicySharing
      .mockClear()
      .mockReturnValue({ upsertSharedPolicy });
  });

  describe('renders policy details pane with expanded information', () => {
    it('render expanded policy info by default', () => {
      const { getByText, getByTestId } = renderComponent();
      expect(getByText('stripes-authorization-components.generalInformation')).toBeInTheDocument();
      expect(getByText('stripes-components.collapseAll')).toBeInTheDocument();
      expect(getByTestId('policy-name')).toHaveTextContent('demo policy');
      expect(getByTestId('policy-description')).toHaveTextContent('simple description');
    });

    it('render dash on empty description', () => {
      const { getByTestId } = renderComponent({ policy: getPolicyData({ description: null }) });

      expect(getByTestId('policy-name')).toHaveTextContent('-');
    });
  });

  describe('ECS mode', () => {
    it('should handle policy sharing when "Share to all" action is performed', async () => {
      isTenantConsortiumCentral.mockReturnValue(true);

      renderComponent({ displayShareAction: true });

      await userEvent.click(screen.getByText('stripes-authorization-components.shareToAll'));
      await userEvent.click(screen.getByRole('button', { name: 'confirm' }));

      expect(upsertSharedPolicy).toHaveBeenCalledWith(expect.objectContaining({ policy: defaultProps.policy }));
    });
  })
});
