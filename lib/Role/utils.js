import { difference } from 'lodash';

import { getUnversionedAppId } from '../utils/helpers';

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
  /**
   * Updates the selected capabilities map based on checkbox state.
   *
   * @param {*} event the checkbox change event.
   * @param {*} id the id of the capability.
   * @returns void
   */
  const onChangeCapabilityCheckbox = (event, id) => {
    const updatedSelectedCapabilitiesMap = { ...selectedCapabilitiesMap };

    if (event.target.checked) {
      updatedSelectedCapabilitiesMap[id] = true;
    } else {
      delete updatedSelectedCapabilitiesMap[id];
    }

    setSelectedCapabilitiesMap(updatedSelectedCapabilitiesMap);
  };

  /**
   * Updates the selected capability sets map and disabled capabilities based on checkbox state.
   * If a capability set is checked, its capabilities are checked and disabled.
   * If a capability set is unchecked, its capabilities are removed from the selected capabilities map.
   * Since saved capability sets store their capabilities in selectedCapabilitiesMap, unchecking a capability set should also clear them from selectedCapabilitiesMap.
   *
   * Example:
   * - Capability Set A contains Capabilities 1, 2, 3.
   * - User checks Capability Set A: Capabilities 1, 2, 3 are added to selectedCapabilitiesMap and disabled.
   * - User saves the role with Capability Set A selected.
   * - Later, user edits the role and unchecks Capability 2 individually: Capability 2 is removed from selectedCapabilitiesMap but remains disabled.
   * - User unchecks Capability Set A: Capabilities 1, 2, 3 are removed from selectedCapabilitiesMap and cleared from disabledCapabilities.
   *
   * @param {*} event the checkbox change event.
   * @param {string} capabilitySetId the id of the capability set.
   * @returns void
   */
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

    const newDisabledCapabilities = { ...disabledCapabilities };

    if (checked) {
      newSelectedCapabilitySetsMap[capabilitySetId] = true;
      capSetCapabilities.forEach((cap) => {
        newDisabledCapabilities[cap] = true;
      });
      setDisabledCapabilities(newDisabledCapabilities);
    } else {
      delete newSelectedCapabilitySetsMap[capabilitySetId];
      capSetCapabilities.forEach((cap) => {
        delete newDisabledCapabilities[cap];
        delete selectedCapabilitiesMap[cap];
      });
      setDisabledCapabilities(newDisabledCapabilities);
      setSelectedCapabilitiesMap(selectedCapabilitiesMap);
    }
    setSelectedCapabilitySetsMap(newSelectedCapabilitySetsMap);
  };

  /**
   * Toggles all capabilities of a specific type and action.
   *
   * @param {*} event the checkbox change event.
   * @param {string} type the capability type.
   * @param {string} action the capability action.
   * @returns void
   */
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

  /**
   * Toggles all capability sets of a specific type and action.
   *
   * @param {*} event the checkbox change event.
   * @param {string} type the capability type.
   * @param {string} action the capability action.
   * @returns void
   */
  const toggleCapabilitySetsHeaderCheckbox = (event, type, action) => {
    const { checked } = event.target;
    const newDisabledCapabilities = { ...disabledCapabilities };
    const typeActionCapSets = actionCapabilitySets[type][action]?.reduce(
      (acc, value) => {
        acc[value] = true;
        return acc;
      },
      {},
    ) || {};

    if (checked) {
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
    } else {
      const newSelectedCapabilities = { ...selectedCapabilitiesMap };
      const newSelectedCapabilitySetsMap = { ...selectedCapabilitySetsMap };

      Object.keys(typeActionCapSets).forEach((capSet) => {
        const found = capabilitySetsList.find(c => c.id === capSet);
        if (!found) return;

        delete newSelectedCapabilitySetsMap[capSet];

        found.capabilities.forEach((c) => {
          delete newDisabledCapabilities[c];
          delete newSelectedCapabilities[c];
        });
      });

      setSelectedCapabilitySetsMap(newSelectedCapabilitySetsMap);
      setSelectedCapabilitiesMap(newSelectedCapabilities);
    }
    setDisabledCapabilities(newDisabledCapabilities);
  };

  /**
   * Checks if all capabilities of a specific type and action are selected.
   *
   * @param {string} action the capability action.
   * @param {string} type the capability type.
   * @returns {boolean} true if all capabilities are selected, false otherwise.
   */
  const isAllActionCapabilitiesSelected = (action, type) => {
    return actionCapabilities[type][action]
      ?.filter((item) => !disabledCapabilities[item])
      .every((item) => !!selectedCapabilitiesMap[item]);
  };

  /**
   * Checks if all capability sets of a specific type and action are selected.
   *
   * @param {string} action the capability action.
   * @param {string} type the capability type.
   * @returns {boolean} true if all capability sets are selected, false otherwise.
   */
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

/**
 * Calculates the number of items (capabilities or capability sets) that would be unselected
 * when certain applications are unselected.
 *
 * @param {Array} unselectedAppIds - Array of application IDs (including version number) that are being unselected.
 * @param {Object} capabilitySets - An object where keys are item categories and values are arrays of items.
 * @param {Object} checkedCapabilitySets - A map indicating which items are currently selected.
 * @param {Object} capabilities - An object where keys are item categories and values are arrays of items.
 * @param {Object} checkedCapabilities - A map indicating which items are currently selected.
 *
 * @returns {Object} An object containing two sets:
 * - `unselectedCapabilitySetCount`: The count of capability sets that would be unselected.
 * - `unselectedCapabilityCount`: The count of capabilities that would be unselected.
 */
export function getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, checkedCapabilitySets, checkedCapabilities) {
  const unselectedCapabilitySets = new Set();
  const unselectedCapabilities = new Set();

  const flatCapabilitySetsList = Object.entries(capabilitySets).flatMap(([_, value]) => value);
  const flatCapabiliesList = Object.entries(capabilities).flatMap(([_, value]) => value);
  const flatList = flatCapabilitySetsList.concat(flatCapabiliesList);

  for (const item of flatList) {
    for (const versionedAppId of unselectedAppIds) {
      if (item.applicationId === getUnversionedAppId(versionedAppId)) {
        if (checkedCapabilitySets[item.id]) {
          unselectedCapabilitySets.add(item.id);

          // Capability sets have child capabilities should be counted as they are unselected too
          for (const capId of item.capabilities) {
            unselectedCapabilities.add(capId);
          }
        }
        if (checkedCapabilities[item.id]) { // It's a capability
          unselectedCapabilities.add(item.id);
        }
      }
    }
  }

  return { unselectedCapabilitySetCount: unselectedCapabilitySets.size, unselectedCapabilityCount: unselectedCapabilities.size };
}

/**
 * Determines if a confirmation modal is needed when unselecting applications,
 * based on whether any capabilities or capability sets would be unselected.
 *
 * @param {Object} selectedAppIds - Map of currently selected application IDs.
 * @param {Object} checkedAppIdsMap - Map of all checked application IDs.
 * @param {Object} capabilities - Object containing capabilities categorized by application ID.
 * @param {Object} capabilitySets - Object containing capability sets categorized by application ID.
 * @param {Object} selectedCapabilitiesMap - Map of currently selected capabilities.
 * @param {Object} selectedCapabilitySetsMap - Map of currently selected capability sets.
 *
 * @returns {Object} An object containing:
 * - `isConfirmationNeeded`: Boolean indicating if confirmation is needed.
 * - `selectedAppIds`: The provided map of selected application IDs.
 * - `unselectedAppIds`: Array of application IDs that are being unselected.
 * - `unselectedCapabilityCount`: Count of capabilities that would be unselected.
 * - `unselectedCapabilitySetCount`: Count of capability sets that would be unselected.
 */
export function changesForUnselect(selectedAppIds, checkedAppIdsMap, capabilities, capabilitySets, selectedCapabilitiesMap, selectedCapabilitySetsMap) {
  let isConfirmationNeeded = false;
  const unselectedAppIds = difference(Object.keys(checkedAppIdsMap), Object.keys(selectedAppIds));

  if (unselectedAppIds.length) {
    const unselectedCapabilities = getUnselectedItemCounts(unselectedAppIds, capabilitySets, capabilities, selectedCapabilitySetsMap, selectedCapabilitiesMap);

    // If there are any capabilities or capability sets that would be unselected, show confirmation modal
    if (unselectedCapabilities.unselectedCapabilitySetCount > 0 || unselectedCapabilities.unselectedCapabilityCount > 0) {
      isConfirmationNeeded = true;

      return {
        isConfirmationNeeded,
        unselectedAppIds,
        unselectedCapabilitySetCount: unselectedCapabilities.unselectedCapabilitySetCount,
        unselectedCapabilityCount: unselectedCapabilities.unselectedCapabilityCount
      };
    }
  }
  return { isConfirmationNeeded };
}
