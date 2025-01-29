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
 *   - queryKeys: keys to invalidate queries
 *   - action capabilities: An object with capabilities based on capability type and action
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

  const actionCapabilities = useMemo(() => {
    const initialStructure = { data: {}, settings: {}, procedural: {} };

    return capabilities.reduce((acc, { type, action, id }) => {
      if (!acc[type][action]) acc[type][action] = [];
      acc[type][action].push(id);

      return acc;
    }, initialStructure);
  }, [capabilities]);

  const checkedAppCaps = useMemo(
    () => capabilities.reduce((acc, capSet) => {
      acc[capSet.id] = true;
      return acc;
    }, {}),
    [capabilities],
  );

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
    actionCapabilities,
  };
};
