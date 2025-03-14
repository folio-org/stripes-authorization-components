import { getCheckboxHandlers } from './utils';

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
});

