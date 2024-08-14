import '@folio/jest-config-stripes/testing-library/jest-dom';

import { renderWithIntl } from 'helpers';
import PolicyDetails from './PolicyDetails';

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

const renderComponent = (data) => renderWithIntl(
  <PolicyDetails policy={data} onClose={onClose} />,
  [
    {
      prefix: 'ui-authorization-policies',
      translations: {
        'meta.title': 'Authorization policies',
        'search': 'Search',
        'new': 'New',
        'columns.name': 'Name',
        'columns.description': 'Description',
        'columns.updatedDate': 'Updated',
        'columns.updatedBy': 'Updated by',
        'assignedUsers': 'Assigned users',
        'assignUnassign': 'Assign/Unassign',
        'generalInformation': 'General Information',
        'permission.settings.admin': 'Settings (Authorization policies): Can manage authorization policies'
      },
    },
  ]
);

describe('PolicyDetails component', () => {
  describe('renders policy details pane with expanded information', () => {
    it('render expanded policy info by default', () => {
      const { getByText, getByTestId } = renderComponent(getPolicyData());
      expect(getByText('General Information')).toBeInTheDocument();
      expect(getByText('Collapse all')).toBeInTheDocument();
      expect(getByTestId('policy-name')).toHaveTextContent('demo policy');
      expect(getByTestId('policy-description')).toHaveTextContent(
        'simple description'
      );
    });

    it('render dash on empty description', () => {
      const { getByTestId } = renderComponent(
        getPolicyData({ description: null })
      );

      expect(getByTestId('policy-description')).toHaveTextContent('-');
    });
  });
});
