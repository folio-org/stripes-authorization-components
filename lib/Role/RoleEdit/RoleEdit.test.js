import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import {
  act,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { CalloutContext } from '@folio/stripes/core';

import { renderWithRouter } from 'helpers';
import {
  useApplicationCapabilities,
  useApplicationCapabilitySets,
  useEditRoleMutation,
  useRoleById,
  useRoleCapabilities,
  useRoleCapabilitySets,
  useRoleSharing,
} from '../../hooks';
import { isShared } from '../../utils';
import { RoleEdit } from './RoleEdit';

const mockPutRequest = jest.fn().mockReturnValue({ ok: true });
const mockPostRequest = jest.fn().mockReturnValue({ ok: true });
const mockSetSelectedCapabilitiesMap = jest.fn();
const mockSetSelectedCapabilitySetsMap = jest.fn();


jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useCapabilities: jest.fn(),
  useEditRoleMutation: jest.fn(),
  useRoleById: jest.fn(),
  useCapabilitySets: jest.fn(),
  useApplicationCapabilities: jest.fn(),
  useApplicationCapabilitySets: jest.fn(),
  useRoleCapabilities: jest.fn(),
  useRoleCapabilitySets: jest.fn(),
  useRoleSharing: jest.fn(),
}));
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  isShared: jest.fn(() => false),
}));

const mockMutateFn = jest.fn(() => Promise.resolve({ id: 'role-id' }));
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useMutation: jest.fn(() => ({ mutate: mockMutateFn, isLoading: false })),
}));

const mockRemoveQueries = jest.fn();
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({
    clear: jest.fn(),
    removeQueries: mockRemoveQueries
  }))
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: 1 }),
  useHistory: jest.fn(() => ({ push: jest.fn() })),
}));

const mockPluggableOnClose = jest.fn();

const mockSubmitPluginImplementation = jest.fn().mockImplementation((onSave, checkedAppIdsMap) => {
  return () => onSave(checkedAppIdsMap, mockPluggableOnClose);
});

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useOkapiKy: () => ({
    put: mockPutRequest,
    post: mockPostRequest
  }),
  Pluggable: ({ checkedAppIdsMap, onSave }) => {
    return <div data-testid="pluggable-select-application">
      <button data-testid="pluggable-submit-button" type="button" onClick={mockSubmitPluginImplementation(onSave, checkedAppIdsMap)}>Select application</button>
    </div>;
  }
}));

jest.mock('@folio/stripes/components', () => {
  const original = jest.requireActual('@folio/stripes/components');
  return {
    ...original,
    Layer: jest.fn(({ children }) => <div data-testid="mock-layer">{children}</div>)
  };
});

const sendCallout = jest.fn();

const renderComponent = () => render(renderWithRouter(
  <CalloutContext.Provider value={{ sendCallout }}>
    <RoleEdit path="/auz/roles/1" />
  </CalloutContext.Provider>
));

describe('RoleEdit', () => {
  const mockMutateRole = jest.fn();
  const upsertSharedRole = jest.fn(() => Promise.resolve());

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockMutateRole.mockClear();
    upsertSharedRole.mockClear();
    useEditRoleMutation.mockReturnValue({ mutateRole: mockMutateRole, isLoading: false });
    useRoleCapabilities.mockReturnValue({
      initialRoleCapabilitiesSelectedMap: { '6e59c367-888a-4561-a3f3-3ca677de437f': true },
      isSuccess: true
    });
    useRoleById.mockReturnValue({
      roleDetails: { id: '1', name: 'Admin', description: 'Description' },
      isSuccess: true
    });
    useRoleCapabilitySets.mockReturnValue({
      initialRoleCapabilitySetsSelectedMap: {},
      isSuccess: true,
      capabilitySetsAppIds: { 'app-platform-complete-0.0.5': true }
    });
    useRoleSharing
      .mockClear()
      .mockReturnValue({ upsertSharedRole });
    useApplicationCapabilities.mockReturnValue({
      capabilities: {
        data: [{
          id: '6e59c367-888a-4561-a3f3-3ca677de437f',
          applicationId: 'app-platform-complete-0.0.5',
          resource: 'Data type resource 1',
          actions: { 'view': '6e59c367-888a-4561-a3f3-3ca677de437f' }
        },
        {
          id: '5c5198f9-de27-4349-9537-dc0b2b41c8c3',
          applicationId: 'app-platform-complete-0.0.5',
          resource: 'Data type resource 2',
          'actions': { 'edit': '5c5198f9-de27-4349-9537-dc0b2b41c8c3' }
        }],
        procedural: [{
          id: '98af4c92-1df2-4916-96b4-886bec72ad29',
          applicationId: 'app-platform-complete-0.0.5',
          resource: 'Procedural type resource',
          actions: { execute: '98af4c92-1df2-4916-96b4-886bec72ad29' }
        }],
        settings: []
      },
      roleCapabilitiesListIds: ['5c5198f9-de27-4349-9537-dc0b2b41c8c3'],
      selectedCapabilitiesMap: { '5c5198f9-de27-4349-9537-dc0b2b41c8c3': true },
      setSelectedCapabilitiesMap: mockSetSelectedCapabilitiesMap,
      isLoading: false,
      queryKeys: ['core', ['app-platform-complete-0.0.5']],
      actionCapabilities: { data:{}, settings:{}, procedural:{} }
    });

    useApplicationCapabilitySets.mockReturnValue({
      capabilitySets: {
        data: [{
          id: 'd2e91897-c10d-46f6-92df-dad77c1e8862',
          applicationId: 'app-platform-complete-0.0.5',
          resource: 'Erm Agreements Collection set',
          actions: { view: 'd2e91897-c10d-46f6-92df-dad77c1e8862' },
          capabilities: []
        }]
      },
      setSelectedCapabilitySetsMap: mockSetSelectedCapabilitySetsMap,
      selectedCapabilitySetsMap: {},
      roleCapabilitySetsListIds: [],
      isLoading: false,
      capabilitySetsList: [
        {
          'id': 'd2e91897-c10d-46f6-92df-dad77c1e8862',
          'description': 'Sample: Create foo item',
          'resource': 'Erm Agreements Collection',
          'action': 'create',
          'type': 'data',
          'applicationId': 'app-platform-complete-0.0.5',
          'capabilities': ['5c5198f9-de27-4349-9537-dc0b2b41c8c3']
        }
      ],
      queryKeys: [['app-platform-complete-0.0.5']],
      actionCapabilitySets: { data:{}, settings:{}, procedural:{} }
    });
  });

  it('renders TextField and Button components', async () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId('create-role-form')).toBeInTheDocument();
  });

  it('changes name, description input values', async () => {
    const { getByTestId } = renderComponent();

    const nameInput = getByTestId('rolename-input');
    const descriptionInput = getByTestId('description-input');

    await act(async () => {
      await userEvent.type(nameInput, ' New Role');
      await userEvent.type(descriptionInput, ' changed');
    });

    expect(nameInput).toHaveValue('Admin New Role');
    expect(descriptionInput).toHaveValue('Description changed');
  });

  it('actions on click footer buttons', async () => {
    const { getByTestId, getByRole } = renderComponent();

    const submitButton = getByRole('button', { name: 'stripes-components.saveAndClose' });
    const cancelButton = getByRole('button', { name: 'stripes-authorization-components.crud.cancel' });

    expect(cancelButton).toBeInTheDocument();

    await act(async () => {
      await userEvent.type(getByTestId('rolename-input'), 'New Role');
    });

    expect(submitButton).toBeEnabled();

    await userEvent.click(cancelButton);
    expect(mockRemoveQueries).toHaveBeenCalledTimes(2);
    expect(mockRemoveQueries).toHaveBeenNthCalledWith(1, { 'queryKey': ['core', 'app-platform-complete-0.0.5'] });
    expect(mockRemoveQueries).toHaveBeenNthCalledWith(2, { 'queryKey': ['app-platform-complete-0.0.5'] });
  });

  it('onSubmit invalidates "ui-authorization-roles" query and calls goBack on success', async () => {
    const { getByRole, getByTestId } = renderComponent();
    const submitButton = getByRole('button', { name: 'stripes-components.saveAndClose' });

    await act(async () => {
      await userEvent.type(getByTestId('rolename-input'), 'Change role');

      await userEvent.click(submitButton);
    });
    expect(submitButton).toBeEnabled();
    expect(mockMutateRole).toHaveBeenCalledTimes(1);
  });

  it('should set role name and description when selectedRole is truthy', () => {
    const { getByTestId } = renderComponent();

    const roleNameInput = getByTestId('rolename-input');
    const descriptionInput = getByTestId('description-input');

    expect(roleNameInput.value).toBe('Admin');
    expect(descriptionInput.value).toBe('Description');
    expect(getByTestId('pluggable-select-application')).toBeInTheDocument();
  });

  it('should call capability/sets to local state on initial loading page, i.e. in useEffect', async () => {
    const { getAllByRole } = renderComponent();

    const headerCheckboxes = 4 * 3;
    const capabilitiesCheckboxLength = 2;
    const capabilitySetsCheckboxLength = 1;

    expect(getAllByRole('checkbox').length).toBe(capabilitiesCheckboxLength + capabilitySetsCheckboxLength + headerCheckboxes);
    expect(mockSetSelectedCapabilitiesMap).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedCapabilitiesMap).toHaveBeenCalledWith({ '6e59c367-888a-4561-a3f3-3ca677de437f': true });
    expect(mockSetSelectedCapabilitySetsMap).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedCapabilitySetsMap).toHaveBeenLastCalledWith({});
  });

  it('should call capabilities checkbox handler UNCHECK action on click', async () => {
    useApplicationCapabilities.mockReturnValue({
      capabilities: {
        data: [
          {
            id: '5c5198f9-de27-4349-9537-dc0b2b41c8c3',
            applicationId: 'app-platform-complete-0.0.5',
            resource: 'Data type resource 2',
            'actions': { 'edit': '5c5198f9-de27-4349-9537-dc0b2b41c8c3' }
          }],
        procedural: [],
        settings: []
      },
      roleCapabilitiesListIds: ['5c5198f9-de27-4349-9537-dc0b2b41c8c3'],
      selectedCapabilitiesMap: { '5c5198f9-de27-4349-9537-dc0b2b41c8c3': true },
      setSelectedCapabilitiesMap: mockSetSelectedCapabilitiesMap,
      isLoading: false,
      queryKeys: ['core', 'app-platform-complete-0.0.5'],
      actionCapabilities: {
        data: {},
        settings: {},
        procedural: {},
      }
    });
    const { getAllByRole } = renderComponent();

    await act(async () => {
      // first 4 checkboxes are header checkboxes
      await userEvent.click(getAllByRole('checkbox')[5]);
    });

    expect(mockSetSelectedCapabilitiesMap).toHaveBeenLastCalledWith({ '6e59c367-888a-4561-a3f3-3ca677de437f': true });
  });

  it('should call capabilities checkbox handler CHECK action on click', async () => {
    useApplicationCapabilities.mockReturnValue({
      capabilities: {
        data: [
          {
            id: '5c5198f9-de27-4349-9537-dc0b2b41c8c3',
            applicationId: 'app-platform-complete-0.0.5',
            resource: 'Data type resource 2',
            'actions': { 'edit': '5c5198f9-de27-4349-9537-dc0b2b41c8c3' }
          }],
        procedural: [],
        settings: []
      },
      roleCapabilitiesListIds: [],
      selectedCapabilitiesMap: {},
      setSelectedCapabilitiesMap: mockSetSelectedCapabilitiesMap,
      isLoading: false,
      actionCapabilities: {
        data: {},
        settings:{},
        procedural: {},
      }
    });
    const { getAllByRole } = renderComponent();

    await act(async () => {
      // first 4 checkboxes are header checkboxes
      await userEvent.click(getAllByRole('checkbox')[5]);
    });

    expect(mockSetSelectedCapabilitiesMap).toHaveBeenLastCalledWith({ '6e59c367-888a-4561-a3f3-3ca677de437f': true });
  });

  it('should call capability sets checkbox handler CHECK action on click', async () => {
    const { getAllByRole } = renderComponent();

    await act(async () => {
      // first 4 checkboxes are header checkboxes
      await userEvent.click(getAllByRole('checkbox')[5]);
    });

    expect(mockSetSelectedCapabilitySetsMap).toHaveBeenCalledTimes(2);
    expect(mockSetSelectedCapabilitySetsMap).toHaveBeenLastCalledWith({ 'd2e91897-c10d-46f6-92df-dad77c1e8862': true });
  });

  it('should call capability sets checkbox handler UNCHECK action on click', async () => {
    useApplicationCapabilitySets.mockReturnValue({
      capabilitySets: {
        data: [{
          id: 'd2e91897-c10d-46f6-92df-dad77c1e8862',
          applicationId: 'app-platform-complete-0.0.5',
          resource: 'Erm Agreements Collection set',
          actions: { view: 'd2e91897-c10d-46f6-92df-dad77c1e8862' },
          capabilities: []
        }]
      },
      setSelectedCapabilitySetsMap: mockSetSelectedCapabilitySetsMap,
      selectedCapabilitySetsMap: { 'd2e91897-c10d-46f6-92df-dad77c1e8862': true },
      roleCapabilitySetsListIds: ['d2e91897-c10d-46f6-92df-dad77c1e8862'],
      isLoading: false,
      capabilitySetsList: [
        {
          'id': 'd2e91897-c10d-46f6-92df-dad77c1e8862',
          'description': 'Sample: Create foo item',
          'resource': 'Erm Agreements Collection',
          'action': 'create',
          'type': 'data',
          'applicationId': 'app-platform-complete-0.0.5',
          'capabilities': []
        }
      ],
      actionCapabilitySets: {
        data: {},
        settings:{},
        procedural: {},
      }
    });
    const { getAllByRole } = renderComponent();

    await act(async () => {
      await userEvent.click(getAllByRole('checkbox')[0]);
    });

    expect(mockSetSelectedCapabilitySetsMap).toHaveBeenCalledTimes(2);
  });

  it('should call on submit select application on mocked Pluggable component ', async () => {
    useRoleCapabilities.mockReturnValue({
      initialRoleCapabilitiesSelectedMap: {},
      isSuccess: true
    });
    useRoleCapabilitySets.mockReturnValue({
      initialRoleCapabilitySetsSelectedMap: {},
      isSuccess: true,
      capabilitySetsAppIds: {}
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId('pluggable-submit-button')).toBeInTheDocument();
    await act(async () => {
      await userEvent.click(getByTestId('pluggable-submit-button'));
    });

    expect(mockSetSelectedCapabilitiesMap).toHaveBeenLastCalledWith({});
  });

  describe('Error handling', () => {
    it('should handle role edit error', async () => {
      const error = new Error('edit fail');

      useEditRoleMutation.mockReturnValue({ mutateRole: jest.fn(() => Promise.reject(error)) });

      const { getByTestId, getByRole } = renderComponent();

      await userEvent.type(getByTestId('rolename-input'), 'Update Role');
      await userEvent.click(getByRole('button', { name: 'stripes-components.saveAndClose' }));

      expect(sendCallout).toHaveBeenCalled();
    });
  });

  describe('ECS mode', () => {
    it('should handle trigger role sharing when a shared role is updated', async () => {
      isShared.mockReturnValue(true);

      render(renderWithRouter(<RoleEdit path="/auz/roles/1" />));

      await userEvent.type(screen.getByTestId('rolename-input'), 'Change role');
      await userEvent.click(screen.getByRole('button', { name: 'stripes-components.saveAndClose' }));

      expect(upsertSharedRole).toHaveBeenCalled();
      expect(mockMutateRole).not.toHaveBeenCalled();
    });
  });
});
