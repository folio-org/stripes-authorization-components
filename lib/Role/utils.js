/**
 * Updates the disabled capabilities based on the provided list and check status.
 *
 * This function takes a list of new disabled capabilities and updates the initial
 * set of disabled capabilities by either incrementing or decrementing the count
 * of each capability based on whether the capabilities are being checked or unchecked.
 *
 * @param {Array} newDisabledList - List of capabilities to update.
 * @param {Object} initialDisabledCapabilities - Current state of disabled capabilities with their counts.
 * @param {boolean} isChecked - Flag indicating whether the capabilities are being checked or unchecked.
 * @returns {Object} Updated disabled capabilities with adjusted counts.
 */
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

/**
 * Batch updates the disabled capabilities based on selected capability sets.
 * like getUpdatedDisabledCapabilities but for each capability set
 *
 * This function iterates over the selected capability sets, finds the corresponding
 * capabilities from the provided list, and updates the previous state of disabled
 * capabilities by adjusting their counts according to the checked status.
 *
 * @param {Object} params - The parameters for the function.
 * @param {Object} params.prevDisabledCapabilities - The current state of disabled capabilities.
 * @param {Array} params.selectedCapabilitySets - The list of selected capability set IDs.
 * @param {Array} params.capabilitySetsList - The list of all capability sets with their capabilities.
 * @param {boolean} params.checked - Flag indicating whether the capabilities are being checked or unchecked.
 * @returns {Object} Updated disabled capabilities with adjusted counts.
 */
export function batchUpdateDisabledCapabilities({
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

export function getCheckboxHandlers({
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
    const { checked } = event.target;

    if (checked) {
      const typeActionCapSets = actionCapabilitySets[type][action]?.reduce(
        (acc, value) => {
          acc[value] = true;
          return acc;
        },
        {},
      );
      const updatedCapabilitySetsMap = {
        ...selectedCapabilitySetsMap,
        ...typeActionCapSets,
      };
      setSelectedCapabilitySetsMap(updatedCapabilitySetsMap);
      setDisabledCapabilities((prevDisabledCaps) => {
        return batchUpdateDisabledCapabilities({
          prevDisabledCaps,
          selectedCapabilitySets: Object.keys(updatedCapabilitySetsMap),
          capabilitySetsList,
          checked,
        });
      });
    } else {
      const filteredFromSelectedCapabilitySets = Object.fromEntries(
        Object.entries(selectedCapabilitySetsMap)
          .filter(([capSet]) => !actionCapabilitySets[type][action]?.includes(capSet)),
      );

      const updatedDisabledCaps = Object.keys(filteredFromSelectedCapabilitySets).reduce((acc, capSet) => {
        const found = capabilitySetsList.find(c => c.id === capSet);
        if (!found) return acc;
        found.capabilities.forEach(capability => {
          if (acc[capability]) {
            acc[capability] += 1;
          } else {
            acc[capability] = 1;
          }
        });
        return acc;
      }, {});

      setSelectedCapabilitySetsMap(filteredFromSelectedCapabilitySets);
      setDisabledCapabilities(updatedDisabledCaps);
    }
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
