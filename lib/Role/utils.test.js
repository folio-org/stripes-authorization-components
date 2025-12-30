import { getCheckboxHandlers, getUnselectedItemCounts, changesForUnselect } from './utils';

jest.mock('../utils/helpers', () => ({
  getUnversionedAppId: jest.fn((id) => `app-${id}`),
}));

describe('useCheckboxHandlers', () => {
  let selectedCapabilitiesMap;
  let setSelectedCapabilitiesMap;
  let capabilitySetsList;
  let setDisabledCapabilities;
  let selectedCapabilitySetsMap;
  let setSelectedCapabilitySetsMap;
  let actionCapabilities;
  let disabledCapabilities;
  let actionCapabilitySets;

  beforeEach(() => {
    selectedCapabilitiesMap = { '5a0d6531-533c-4f48-a9a6-93e266ebd28a': true };
    setSelectedCapabilitiesMap = jest.fn();
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
    disabledCapabilities = { 'cap1': true, 'cap15': true, 'cap16':true };
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
    expect(setDisabledCapabilities).toHaveBeenCalledWith({ cap1: true, cap15: true, cap16:true });
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
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupA: [
          { id: 'setA', applicationId: 'app-2', capabilities: ['cap1'] },
        ],
      };
      const capabilities = {
        groupB: [
          { id: 'capB', applicationId: 'app-2' },
        ],
      };
      const checkedCapabilitySets = {};
      const checkedCapabilities = {};

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 0 });
    });

    it('counts unselected capability sets with their child capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupA: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1', 'cap2'] },
        ],
      };
      const capabilities = {};
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1: true, cap2: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 2 });
    });

    it('counts only checked capabilities when capability set is unchecked', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupA: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1', 'cap2'] },
        ],
      };
      const capabilities = {};
      const checkedCapabilitySets = {};
      const checkedCapabilities = { cap1: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 0 });
    });

    it('counts capabilities only once if duplicates are present', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupSets: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1', 'cap2'] },
          { id: 'setB', applicationId: 'app-1', capabilities: ['cap1', 'cap2'] },
        ],
      };
      const capabilities = {};
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1: true, cap2: true };
      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 2 });
    });

    it('counts unselected standalone capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {};
      const capabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-1' },
          { id: 'capB', applicationId: 'app-1' },
        ],
      };
      const checkedCapabilitySets = {};
      const checkedCapabilities = { capA: true, capB: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 0, unselectedCapabilityCount: 2 });
    });

    it('handles mixed capability sets and capabilities', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupSets: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1'] },
        ],
      };
      const capabilities = {
        groupCaps: [
          { id: 'capB', applicationId: 'app-1' },
        ],
      };
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1: true, capB: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 2 });
    });

    it('handles multiple unselected app ids', () => {
      const unselectedAppIds = ['1', '2'];
      const capabilitySets = {
        groupA: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1'] },
          { id: 'setB', applicationId: 'app-2', capabilities: ['cap2'] },
        ],
      };
      const capabilities = {};
      const checkedCapabilitySets = { setA: true, setB: true };
      const checkedCapabilities = { cap1: true, cap2: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 2, unselectedCapabilityCount: 2 });
    });

    it('does not count unchecked child capabilities of checked capability set', () => {
      const unselectedAppIds = ['1'];
      const capabilitySets = {
        groupA: [
          { id: 'setA', applicationId: 'app-1', capabilities: ['cap1', 'cap2'] },
        ],
      };
      const capabilities = {};
      const checkedCapabilitySets = { setA: true };
      const checkedCapabilities = { cap1: true };

      const result = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities);

      expect(result).toEqual({ unselectedCapabilitySetCount: 1, unselectedCapabilityCount: 2 });
    });
  });

  describe('determineIfConfirmationNeededForUnselectedApps', () => {
    it('returns isConfirmationNeeded false when there are no unselected apps', () => {
      const selectedAppIds = { '1': true };
      const checkedAppIdsMap = { '1': true };
      const capabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-1' },
        ],
      };
      const capabilitySets = {};
      selectedCapabilitiesMap = { capA: true };
      selectedCapabilitySetsMap = {};

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        capabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result).toEqual({ isConfirmationNeeded: false });
    });

    it('returns isConfirmationNeeded false when unselected apps do not cause any selected items to be unselected', () => {
      const selectedAppIds = { '1': true };
      const checkedAppIdsMap = { '1': true, '2': true }; // '2' is unselected
      const capabilities = {
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
      selectedCapabilitySetsMap = { 'set-1': true };

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        capabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result).toEqual({ isConfirmationNeeded: false });
    });

    it('returns detailed result with capability sets when unselected apps have capability sets', () => {
      const selectedAppIds = { '1': true };
      const checkedAppIdsMap = { '1': true, '2': true };
      const capabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-1' },
        ],
      };
      const capabilitySets = {
        groupSets: [
          { id: 'setA', applicationId: 'app-2', capabilities: ['cap1', 'cap2'] },
        ],
      };
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
      expect(result.unselectedAppIds).toContain('2');
      expect(result.unselectedCapabilitySetCount).toBe(1);
      expect(result.unselectedCapabilityCount).toBe(2);
    });

    it('returns isConfirmationNeeded false when unselected capabilities and sets are not checked', () => {
      const selectedAppIds = { '1': true };
      const checkedAppIdsMap = { '1': true, '2': true };
      const capabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-2' },
        ],
      };
      const capabilitySets = {
        groupSets: [
          { id: 'setA', applicationId: 'app-2' },
        ],
      };
      selectedCapabilitiesMap = { capA: false };
      selectedCapabilitySetsMap = { setA: false };

      const result = changesForUnselect(
        selectedAppIds,
        checkedAppIdsMap,
        capabilities,
        capabilitySets,
        selectedCapabilitiesMap,
        selectedCapabilitySetsMap,
      );

      expect(result.isConfirmationNeeded).toBe(false);
    });

    it('handles multiple unselected apps correctly', () => {
      const selectedAppIds = { '1': true };
      const checkedAppIdsMap = { '1': true, '2': true, '3': true };
      const capabilities = {
        groupA: [
          { id: 'capA', applicationId: 'app-2' },
          { id: 'capB', applicationId: 'app-3' },
        ],
      };
      const capabilitySets = {};
      selectedCapabilitiesMap = { capA: true, capB: true };
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
      expect(result.unselectedAppIds).toContain('2');
      expect(result.unselectedAppIds).toContain('3');
      expect(result.unselectedCapabilityCount).toBe(2);
    });
  });
});
