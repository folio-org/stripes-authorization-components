import keyBy from 'lodash/keyBy';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import isEmpty from 'lodash/isEmpty';
import {
  extractSelectedIdsFromObject,
  getCapabilitiesGroupedByTypeAndResource,
} from '../../utils';
import { useChunkedApplicationCapabilities } from '../useChunkedApplicationCapabilities';

function removeUncheckedCaps(checkedAppCaps) {
  return (prevCaps) => {
    const copy = { ...prevCaps };
    let hasChanged = false;

    for (const cap in copy) {
      if (!(cap in checkedAppCaps)) {
        delete copy[cap];
        hasChanged = true;
      }
    }

    return hasChanged ? copy : prevCaps;
  };
}

/**
 * Custom hook that retrieves application capabilities based on the selected application IDs.
 *
 * @param {Object} checkedAppIdsMap - An object containing the selected application IDs. Using
 *   this object, the hook will retrieve the capabilities for the selected applications.
 * @param {Object} options - query options.
 * @param {Function} setDisabledCapabilities - disabled capabilities setter function.
 * @return {Object} An object containing the following properties:
 *   - capabilities: An object containing the capabilities grouped by type and resource.
 *   - selectedCapabilitiesMap: An object containing the selected capabilities mapped by their IDs.
 *   - roleCapabilitiesListIds: An array containing the IDs of the selected capabilities.
 *   - setSelectedCapabilitiesMap: A function to update the selected capabilities map.
 *   - isLoading: A boolean indicating if the capabilities are currently being loaded.
 */

export const useApplicationCapabilities = ({
  checkedAppIdsMap,
  options = {},
  setDisabledCapabilities,
}) => {
  const { tenantId } = options;

  const selectedAppIds = extractSelectedIdsFromObject(checkedAppIdsMap);
  const {
    items: capabilities,
    isLoading: isCapabilitiesLoading,
    queryKeys,
  } = useChunkedApplicationCapabilities(selectedAppIds, { tenantId });

  const [selectedCapabilitiesMap, setSelectedCapabilitiesMap] = useState({});
  const roleCapabilitiesListIds = extractSelectedIdsFromObject(selectedCapabilitiesMap);

  const roleCapabilitiesListNames = useMemo(() => {
    const capabilitiesMap = keyBy(capabilities, 'id');

    return roleCapabilitiesListIds
      .map((capabilityId) => capabilitiesMap[capabilityId]?.name)
      .filter(Boolean);
  }, [capabilities, roleCapabilitiesListIds]);

  const memoizedCapabilities = useMemo(() => getCapabilitiesGroupedByTypeAndResource(capabilities), [capabilities]);

  const checkedAppCaps = useMemo(
    () => capabilities.reduce((acc, capSet) => {
      acc[capSet.id] = true;
      return acc;
    }, {}),
    [capabilities],
  );

  /*
    What happens in useEffect?
    Our useApplicationCapabilities hook receives a list of the selected applications as argument,
    and we retrieve the capabilities ONLY for the selected applications.
    The user will then be able to select from the provided capabilities.
    useEffect handles the situation where the user changes the selected applications, causing new capabilities to be retrieved.
    However, previously selected capabilities may no longer be present in the new list of selected application capabilities.
    It filters them by checking whether the selected capability set is included in the new list of capabilities.
    It iterates over selectedCapabilitiesMap, disabledCapabilities, and if any of them are not in the new list of capabilitySets,
    they are removed.
    Example,
      const selectedCapabilitiesMap = { id1: true, id2: true },
            disabledCapabilities = { id3: true }
            checkedAppCaps = { id1: true };
     1. Since checkedAppCaps does not include id2, it is removed from selectedCapabilitiesMap.
     2. Since checkedAppCaps does not include id3, it is removed from disabledCapabilities
   */

  useEffect(() => {
    if (!isCapabilitiesLoading && !isEmpty(checkedAppCaps)) {
      setSelectedCapabilitiesMap(removeUncheckedCaps(checkedAppCaps));
      setDisabledCapabilities(removeUncheckedCaps(checkedAppCaps));
    }
    // setDisabledCapabilities comes from outside, so we don't need to add it to the dependencies list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedAppCaps, isCapabilitiesLoading]);

  return {
    capabilities: memoizedCapabilities,
    selectedCapabilitiesMap,
    roleCapabilitiesListIds,
    roleCapabilitiesListNames,
    setSelectedCapabilitiesMap,
    isLoading: isCapabilitiesLoading,
    queryKeys,
  };
};
