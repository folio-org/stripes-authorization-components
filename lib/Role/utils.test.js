import { getCheckboxHandlers, getUnselectedItemCounts, changesForUnselect } from './utils';

jest.mock('../utils/helpers', () => ({
  getUnversionedAppId: jest.fn((id) => `app-${id}`),
}));

describe('useCheckboxHandlers', () => {
  let selectedCapabilitiesMap;
  let setSelectedCapabilitiesMap;
  let capabilitySetsList;
  let capabilities;
  let setDisabledCapabilities;
  let selectedCapabilitySetsMap;
  let setSelectedCapabilitySetsMap;
  let actionCapabilities;
  let disabledCapabilities;
  let actionCapabilitySets;

  beforeEach(() => {
    selectedCapabilitiesMap = { '5a0d6531-533c-4f48-a9a6-93e266ebd28a': true };
    setSelectedCapabilitiesMap = jest.fn();
    capabilities = {
      'data': [
        {
          'id': 'cap1_create',
          'resource': 'Cap 1',
          'applicationId': 'app-1',
          'actions': {
            'create': 'cap1_create',
            'view': 'cap1_view',
            'edit': 'cap1_edit',
            'delete': 'cap1_delete',
            'manage': 'cap1_manage'
          }
        },
        {
          'id': 'cap2_view',
          'resource': 'Cap 2',
          'applicationId': 'app-2',
          'actions': {
            'view': 'cap2_view',
            'manage': 'cap2_manage'
          }
        },
        {
          'id': 'cap3_view',
          'resource': 'Cap 3',
          'applicationId': 'app-3',
          'actions': {
            'view': 'cap3_view',
            'manage': 'cap3_manage'
          }
        }
      ]
    };
    capabilitySetsList = [
      {
        'id': 'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c',
        'name': 'batch-print_entries.manage',
        'action': 'view',
        'type': 'data',
        'permission': 'batch-print.entries.all',
        'capabilities': ['cap1'],
      }
    ];
    setDisabledCapabilities = jest.fn();
    selectedCapabilitySetsMap = { 'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c': true };
    setSelectedCapabilitySetsMap = jest.fn();
    actionCapabilities = {
      data: {
        view: ['5a0d6531-533c-4f48-a9a6-93e266ebd28a'],
        manage:[]
      },
      settings:{},
      procedural:{}
    };
    disabledCapabilities = { 'cap1': true, 'cap15': true, 'cap16': true };
    actionCapabilitySets = {
      data: {
        view: ['b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c'],
      },
      settings:{},
      procedural:{}
    };
  });

  it('onChangeCapabilityCheckbox should call selectedCapabilitiesMap when checked is TRUE', () => {
    const { onChangeCapabilityCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    onChangeCapabilityCheckbox({ target: { checked: true } }, '5a0d6531-533c-4f48-a9a6-93e266ebd28a');

    expect(setSelectedCapabilitiesMap).toHaveBeenCalledWith({ '5a0d6531-533c-4f48-a9a6-93e266ebd28a': true });
  });

  it('onChangeCapabilityCheckbox should call selectedCapabilitiesMap when checked is FALSE', () => {
    const { onChangeCapabilityCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    onChangeCapabilityCheckbox({ target: { checked: false } }, '5a0d6531-533c-4f48-a9a6-93e266ebd28a');

    expect(setSelectedCapabilitiesMap).toHaveBeenCalledWith({});
  });

  it('onChangeCapabilitySetCheckbox should call selectedCapabilitySetsMap when checked is TRUE ', () => {
    const { onChangeCapabilitySetCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    onChangeCapabilitySetCheckbox(
      { target: { checked: true } },
      'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c',
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({ 'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c':true });
    expect(setDisabledCapabilities).toHaveBeenCalledWith({ cap1: true, cap15: true, cap16: true });
  });

  it('onChangeCapabilitySetCheckbox should call selectedCapabilitySetsMap when checked is FALSE ', () => {
    const { onChangeCapabilitySetCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    onChangeCapabilitySetCheckbox(
      { target: { checked: false } },
      'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c',
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({});
    expect(setDisabledCapabilities).toHaveBeenCalledWith({ 'cap15': true, 'cap16': true });
    expect(setSelectedCapabilitiesMap).not.toHaveBeenCalled();
  });

  it('onChangeCapabilitySetCheckbox should disable previously saved capabilities when checked is FALSE ', () => {
    const savedSelectedCapabilitiesMap = { 'cap1': true };

    const { onChangeCapabilitySetCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap: savedSelectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    onChangeCapabilitySetCheckbox(
      { target: { checked: true } },
      'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c',
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({ 'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c': true });
    expect(setDisabledCapabilities).toHaveBeenCalledWith({ 'cap1': true, 'cap15': true, 'cap16': true });
    expect(setSelectedCapabilitiesMap).toHaveBeenCalledTimes(0);

    setSelectedCapabilitySetsMap.mockClear();
    setDisabledCapabilities.mockClear();
    setSelectedCapabilitiesMap.mockClear();

    onChangeCapabilitySetCheckbox(
      { target: { checked: false } },
      'b7cbae7f-5d7a-4af5-bd4e-f70ad245ba2c',
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({});
    expect(setDisabledCapabilities).toHaveBeenCalledWith({ 'cap15': true, 'cap16': true });
    expect(setSelectedCapabilitiesMap).not.toHaveBeenCalled();
  });

  it('toggleCapabilitiesHeaderCheckbox when checked is FALSE ', () => {
    const { toggleCapabilitiesHeaderCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    toggleCapabilitiesHeaderCheckbox(
      { target: { checked: false } },
      'data',
      'view'
    );

    expect(setSelectedCapabilitiesMap).toHaveBeenCalledWith({});
  });

  it('toggleCapabilitiesHeaderCheckbox when checked is TRUE ', () => {
    const { toggleCapabilitiesHeaderCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    toggleCapabilitiesHeaderCheckbox(
      { target: { checked: true } },
      'data',
      'view'
    );

    expect(setSelectedCapabilitiesMap).toHaveBeenCalledTimes(1);
  });

  it('should check if isAllActionCapabilitiesSelected', () => {
    const { isAllActionCapabilitiesSelected } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    expect(isAllActionCapabilitiesSelected('view', 'data')).toBe(true);
  });

  it('should check if isAllActionCapabilitySetsSelected', () => {
    const { isAllActionCapabilitySetsSelected } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    expect(isAllActionCapabilitySetsSelected('not existing action', 'data')).toBeFalsy();
    expect(isAllActionCapabilitySetsSelected('view', 'data')).toBe(true);
  });

  it('toggleCapabilitySetsHeaderCheckbox when checked is FALSE ', () => {
    const { toggleCapabilitySetsHeaderCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    toggleCapabilitySetsHeaderCheckbox(
      { target: { checked: false } },
      'data',
      'view'
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({});
  });

  it('toggleCapabilitySetsHeaderCheckbox when checked is TRUE ', () => {
    const { toggleCapabilitySetsHeaderCheckbox } = getCheckboxHandlers({
      selectedCapabilitiesMap,
      setSelectedCapabilitiesMap,
      capabilitySetsList,
      setDisabledCapabilities,
      selectedCapabilitySetsMap,
      setSelectedCapabilitySetsMap,
      actionCapabilities,
      disabledCapabilities,
      actionCapabilitySets,
    });

    toggleCapabilitySetsHeaderCheckbox(
      { target: { checked: true } },
      'data',
      'view'
    );

    expect(setSelectedCapabilitySetsMap).toHaveBeenCalledTimes(1);
  });

  describe('getUnselectedItemCounts', () => {
    it('returns zero counts when no items match unselected app ids', () => {
      const unselectedAppIds = ['99'];
      const capabilitySets = [
        { id: 'setZ', resource: 'Set Z', action: 'view', applicationId: '2', capabilities: ['cap1_view'] },
      ];
      const checkedCapabilitySets = {};
      const checkedCapabilities = {};

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 0 });
    });

    it('counts unselected capability sets with their child capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: '1', capabilities: ['cap1_view', 'cap2_view'] },
      ];
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1_view: true, cap2_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 3 });
    });

    it('counts only checked capabilities when capability set is unchecked', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: '1', capabilities: ['cap1_view', 'cap2_view'] },
      ];
      const checkedCapabilitySets = {};
      const checkedCapabilities = { cap1_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 1 });
    });

    it('counts capabilities only once if duplicates are present', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: '1', capabilities: ['cap1_view', 'cap2_view'] },
        { id: 'setB', resource: 'Set B', action: 'view', applicationId: '2', capabilities: ['cap1_view', 'cap2_view'] },
      ];
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1_view: true, cap2_view: true };
      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 3 });
    });

    it('counts unselected standalone capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [];
      const checkedCapabilitySets = {};
      const checkedCapabilities = { cap1_view: true, cap2_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 1 });
    });

    it('handles mixed capability sets and capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: '1', capabilities: ['cap1_view'] },
      ];
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1_view: true, cap2_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 2 });
    });

    it('handles multiple unselected app ids', () => {
      const unselectedAppIds = ['1', '2'];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: '1', capabilities: ['cap1_view'] },
        { id: 'setB', resource: 'Set B', action: 'view', applicationId: '2', capabilities: ['cap2_view'] }
      ];
      const checkedCapabilitySets = { setA: true, setB: true };
      const checkedCapabilities = { cap1_view: true, cap2_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 2, unselectedCapabilityCount: 3 });
    });

    it('does not count unchecked child capabilities of checked capability set', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = [
        { id: 'setA', applicationId: '1', capabilities: ['cap1_view', 'cap2_view'] },
      ];
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1_view: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 3 });
    });
  });

  describe('determineIfConfirmationNeededForUnselectedApps', () => {
    it('returns isConfirmationNeeded false when there are no unselected apps', () => {
      const selectedAppIds = { 'app-1': true };
      const checkedAppIdsMap = { 'app-1': true };
      const localCapabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-1' },
        ],
      };
      const capabilitySets = [];
      selectedCapabilitiesMap = { capA: true };
      selectedCapabilitySetsMap = {};

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        localCapabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result).toEqual({ isConfirmationNeeded: false });
    });

    it('returns isConfirmationNeeded false when unselected apps do not cause any selected items to be unselected', () => {
      const selectedAppIds = { 'app-1': true };
      const checkedAppIdsMap = { 'app-1': true, 'app-2': true }; // '2' is unselected
      const localCapabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-1' },
        ],
      };
      const capabilitySets = {
        setA: [
          { id: 'set-1', applicationId: 'app-1' },
        ],
      };
      selectedCapabilitiesMap = { capA: true };
      selectedCapabilitySetsMap = { 'setA': true };

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        localCapabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result).toEqual({ isConfirmationNeeded: false });
    });

    it('returns detailed result with capability sets when unselected apps have capability sets', () => {
      const selectedAppIds = { 'app-1': true };
      const checkedAppIdsMap = { 'app-1': true, 'app-2': true };
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: 'app-2', capabilities: ['cap1', 'cap2'] },
      ];
      selectedCapabilitiesMap = { capA: true };
      selectedCapabilitySetsMap = { setA: true };

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        capabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result.isConfirmationNeeded).toBe(true);
      expect(result.unselectedAppIds).toContain('app-2');
      expect(result.unselectedCapabilitySetCount).toBe(1);
      expect(result.unselectedCapabilityCount).toBe(7);
    });

    it('returns isConfirmationNeeded false when unselected capabilities and sets are not checked', () => {
      const selectedAppIds = { 'app-1': true };
      const checkedAppIdsMap = { 'app-1': true, 'app-2': true };
      const localCapabilities = [
        { id: 'capA', applicationId: 'app-2' },
      ];
      const capabilitySets = [
        { id: 'setA', resource: 'Set A', action: 'view', applicationId: 'app-2' },
      ];
      selectedCapabilitiesMap = {};
      selectedCapabilitySetsMap = {};

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        localCapabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result.isConfirmationNeeded).toBe(false);
    });

    it.skip('handles multiple unselected apps correctly', () => { // TODO: fix
      const selectedAppIds = { 'app-3': true };
      const checkedAppIdsMap = { 'app-1': true, 'app-2': true, 'app-3': true };
      const capabilitySets = [];
      selectedCapabilitiesMap = { cap1_view: true, cap2_view: true };
      selectedCapabilitySetsMap = {};

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        capabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result.isConfirmationNeeded).toBe(true);
      expect(result.unselectedAppIds).toContain('app-2');
      expect(result.unselectedAppIds).toContain('app-3');
      expect(result.unselectedCapabilityCount).toBe(2);
    });

    it('toggleCapabilitySetsHeaderCheckbox should handle mixed checked and unchecked states', () => {
      const { toggleCapabilitySetsHeaderCheckbox } = getCheckboxHandlers({
        selectedCapabilitiesMap: { 'cap1': true },
        setSelectedCapabilitiesMap,
        capabilitySetsList: [
          {
            id: 'setA',
            name: 'Set A',
            capabilities: ['cap1', 'cap2'],
          },
          {
            id: 'setB',
            name: 'Set B',
            capabilities: ['cap3'],
          },
        ],
        setDisabledCapabilities,
        selectedCapabilitySetsMap: { 'setA': true },
        setSelectedCapabilitySetsMap,
        actionCapabilities,
        disabledCapabilities: { 'cap1': true, 'cap2': true },
        actionCapabilitySets: {
          data: {
            view: ['setA', 'setB'],
          },
          settings: {},
          procedural: {},
        },
      });

      toggleCapabilitySetsHeaderCheckbox(
        { target: { checked: true } },
        'data',
        'view'
      );

      expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({ 'setA': true, 'setB': true });
      expect(setSelectedCapabilitiesMap).not.toHaveBeenCalled();
      expect(setDisabledCapabilities).toHaveBeenCalledWith({ 'cap1': true, 'cap2': true, 'cap3': true });

      setSelectedCapabilitiesMap.mockClear();
      setSelectedCapabilitySetsMap.mockClear();
      setDisabledCapabilities.mockClear();

      toggleCapabilitySetsHeaderCheckbox(
        { target: { checked: false } },
        'data',
        'view'
      );

      expect(setSelectedCapabilitySetsMap).toHaveBeenCalledWith({});
      expect(setSelectedCapabilitiesMap).toHaveBeenCalledWith({});
      expect(setDisabledCapabilities).toHaveBeenCalledWith({});
    });
  });
});
