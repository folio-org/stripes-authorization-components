/**
 * Provides handlers for managing checkbox states related to capabilities and capability sets.
 *
 * @param {Object} params - The parameters for the handlers.
 * @param {Object} params.selectedCapabilitiesMap - Current map of selected capabilities.
 * @param {Function} params.setSelectedCapabilitiesMap - Function to update the selected capabilities map.
 * @param {Array} params.capabilitySetsList - List of available capability sets.
 * @param {Function} params.setDisabledCapabilities - Function to update the disabled capabilities.
 * @param {Object} params.selectedCapabilitySetsMap - Current map of selected capability sets.
 * @param {Function} params.setSelectedCapabilitySetsMap - Function to update the selected capability sets map.
 * @param {Object} params.actionCapabilities - Object containing capabilities categorized by type and action.
 * @param {Object} params.disabledCapabilities - Map of currently disabled capabilities.
 * @param {Object} params.actionCapabilitySets - Object containing capability sets categorized by type and action.
 *
 * @returns {Object} Handlers for checkbox interactions:
 * - `onChangeCapabilityCheckbox`: Updates the selected capabilities map based on checkbox state.
 * - `onChangeCapabilitySetCheckbox`: Updates the selected capability sets map and disabled capabilities based on checkbox state.
 * - `toggleCapabilitiesHeaderCheckbox`: Toggles all capabilities of a specific type and action.
 * - `toggleCapabilitySetsHeaderCheckbox`: Toggles all capability sets of a specific type and action.
 * - `isAllActionCapabilitiesSelected`: Checks if all capabilities of a specific type and action are selected.
 * - `isAllActionCapabilitySetsSelected`: Checks if all capability sets of a specific type and action are selected.
 */

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

    // If checked set selected capability set id to true {foo: true}
    // If unchecked remove selected capability set id from selectedCapabilitySetsMap {} instead of {foo: false}
    const newSelectedCapabilitySetsMap = { ...selectedCapabilitySetsMap };

    const capSetCapabilities = selectedCapabilitySet.capabilities;

    if (checked) {
      const newDisabledCapabilities = { ...disabledCapabilities };
      newSelectedCapabilitySetsMap[capabilitySetId] = true;
      capSetCapabilities.forEach((cap) => {
        newDisabledCapabilities[cap] = true;
      });
      setDisabledCapabilities(newDisabledCapabilities);
    } else {
      const newDisabledCapabilities = { ...disabledCapabilities };
      delete newSelectedCapabilitySetsMap[capabilitySetId];
      capSetCapabilities.forEach((cap) => {
        delete newDisabledCapabilities[cap];
      });
      setDisabledCapabilities(newDisabledCapabilities);
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

  const toggleCapabilitySetsHeaderCheckbox = (event, type, action) => {
    const { checked } = event.target;

    if (checked) {
      const newDisabledCapabilities = { ...disabledCapabilities };
      const typeActionCapSets = actionCapabilitySets[type][action]?.reduce(
        (acc, value) => {
          acc[value] = true;
          return acc;
        },
        {},
      ) || {};
      const updatedCapabilitySetsMap = {
        ...selectedCapabilitySetsMap,
        ...typeActionCapSets,
      };

      Object.keys(typeActionCapSets).forEach((capSet) => {
        const found = capabilitySetsList.find(c => c.id === capSet);
        if (!found) return;
        found.capabilities.forEach((c) => {
          newDisabledCapabilities[c] = true;
        });
      });
      setSelectedCapabilitySetsMap(updatedCapabilitySetsMap);
      setDisabledCapabilities(newDisabledCapabilities);
    } else {
      const newDisabledCapabilities = {};
      const filteredFromSelectedCapabilitySets = Object.fromEntries(
        Object.entries(selectedCapabilitySetsMap)
          .filter(([capSet]) => !actionCapabilitySets[type][action]?.includes(capSet)),
      );

      Object.keys(filteredFromSelectedCapabilitySets)
        .forEach(capSet => {
          const found = capabilitySetsList.find(c => c.id === capSet);
          if (!found) return;

          found.capabilities.forEach(c => {
            newDisabledCapabilities[c] = true;
          });
        });

      setSelectedCapabilitySetsMap(filteredFromSelectedCapabilitySets);
      setDisabledCapabilities(newDisabledCapabilities);
    }
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


  return {
    onChangeCapabilityCheckbox,
    onChangeCapabilitySetCheckbox,
    toggleCapabilitiesHeaderCheckbox,
    toggleCapabilitySetsHeaderCheckbox,
    isAllActionCapabilitiesSelected,
    isAllActionCapabilitySetsSelected,
  };
}
