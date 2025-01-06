export function getUpdatedDisabledCapabilities(newDisabledList, initialDisabledCapabilities, isChecked) {
  const result = { ...initialDisabledCapabilities };
  const add = (item, currentCount) => {
    result[item] = currentCount + 1;
  };
  const remove = (item, currentCount) => {
    if (currentCount > 1) {
      result[item] = currentCount - 1;
    } else {
      delete result[item];
    }
  };

  newDisabledList.forEach(item => {
    const currentCount = result[item] || 0;
    if (isChecked) {
      add(item, currentCount);
    } else {
      remove(item, currentCount);
    }
  });

  return result;
}

export function batchUpdatedDisabledCapabilities({
  prevDisabledCapabilities,
  selectedCapabilitySets,
  capabilitySetsList,
  checked,
}) {
  let result = { ...prevDisabledCapabilities };
  selectedCapabilitySets.forEach((cap) => {
    const found = capabilitySetsList.find((c) => c.id === cap);
    if (!found) return;

    result = getUpdatedDisabledCapabilities(
      found.capabilities,
      result,
      checked,
    );
  });

  return result;
}

export function useCheckboxHandlers({
  selectedCapabilitiesMap,
  setSelectedCapabilitiesMap,
  capabilitySetsList,
  setDisabledCapabilities,
  selectedCapabilitySetsMap,
  setSelectedCapabilitySetsMap,
  actionCapabilities,
  disabledCapabilities,
  actionCapabilitySets
}) {
  const onChangeCapabilityCheckbox = (event, id) => {
    const updatedSelectedCapabilitiesMap = { ...selectedCapabilitiesMap };

    if (event.target.checked) {
      updatedSelectedCapabilitiesMap[id] = true;
    } else {
      delete updatedSelectedCapabilitiesMap[id];
    }

    setSelectedCapabilitiesMap(updatedSelectedCapabilitiesMap);
  };

  const onChangeCapabilitySetCheckbox = (event, capabilitySetId) => {
    const { checked } = event.target;
    const selectedCapabilitySet = capabilitySetsList.find(
      (cap) => cap.id === capabilitySetId,
    );
    if (!selectedCapabilitySet) return;

    setDisabledCapabilities((prevDisabledCaps) => {
      return getUpdatedDisabledCapabilities(
        selectedCapabilitySet.capabilities,
        prevDisabledCaps,
        checked,
      );
    });
    // If checked set selected capability set id to true {foo: true}
    // If unchecked remove selected capability set id from selectedCapabilitySetsMap {} instead of {foo: false}
    const newSelectedCapabilitySetsMap = { ...selectedCapabilitySetsMap };

    if (checked) {
      newSelectedCapabilitySetsMap[capabilitySetId] = true;
    } else {
      delete newSelectedCapabilitySetsMap[capabilitySetId];
    }

    setSelectedCapabilitySetsMap(newSelectedCapabilitySetsMap);
  };

  const toggleCapabilitiesHeaderCheckbox = (event, type, action) => {
    if (!event.target.checked) {
      const filteredFromSelectedCapabilities = Object.fromEntries(
        Object.entries(selectedCapabilitiesMap).filter(
          ([cap]) => !actionCapabilities[type][action]?.includes(cap),
        ),
      );
      setSelectedCapabilitiesMap(filteredFromSelectedCapabilities);
      return;
    }
    const typeActionCaps =
      actionCapabilities[type][action]?.reduce((acc, value) => {
        if (!(value in disabledCapabilities)) {
          acc[value] = true;
        }

        return acc;
      }, {}) || {};
    setSelectedCapabilitiesMap((prevCaps) => ({
      ...prevCaps,
      ...typeActionCaps,
    }));
  };

  const isAllActionCapabilitiesSelected = (action, type) => {
    return actionCapabilities[type][action]
      ?.filter((item) => !disabledCapabilities[item])
      .every((item) => !!selectedCapabilitiesMap[item]);
  };

  const isAllActionCapabilitySetsSelected = (action, type) => {
    return actionCapabilitySets[type][action]?.every(
      (capSet) => !!selectedCapabilitySetsMap[capSet],
    );
  };

  const toggleCapabilitySetsHeaderCheckbox = (event, type, action) => {
    const filteredFromSelectedCapabilitySets = Object.fromEntries(
      Object.entries(selectedCapabilitySetsMap).filter(
        ([capSet]) => !actionCapabilitySets[type][action]?.includes(capSet),
      ),
    );
    const { checked } = event.target;

    if (checked) {
      setSelectedCapabilitySetsMap((prevCapSets) => ({
        ...prevCapSets,
        ...filteredFromSelectedCapabilitySets,
      }));
    } else {
      setSelectedCapabilitySetsMap(filteredFromSelectedCapabilitySets);
    }

    setDisabledCapabilities((prevDisabledCaps) => batchUpdatedDisabledCapabilities({
      prevDisabledCaps,
      selectedCapabilitySets:Object.keys(filteredFromSelectedCapabilitySets),
      capabilitySetsList,
      checked,
    }));
  };

  return {
    onChangeCapabilityCheckbox,
    onChangeCapabilitySetCheckbox,
    toggleCapabilitiesHeaderCheckbox,
    isAllActionCapabilitiesSelected,
    isAllActionCapabilitySetsSelected,
    toggleCapabilitySetsHeaderCheckbox,
  };
}

