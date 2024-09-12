import keyBy from 'lodash/keyBy';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  extractSelectedIdsFromObject,
  getCapabilitiesGroupedByTypeAndResource,
  getOnlyIntersectedWithApplicationsCapabilities,
} from '../../utils';
import { useChunkedApplicationCapabilities } from '../useChunkedApplicationCapabilities';

/**
 * Custom hook that retrieves application capabilities based on the selected application IDs.
 *
 * @param {Object} checkedAppIdsMap - An object containing the selected application IDs. Using
 *   this object, the hook will retrieve the capabilities for the selected applications.
 * @return {Object} An object containing the following properties:
 *   - capabilities: An object containing the capabilities grouped by type and resource.
 *   - selectedCapabilitiesMap: An object containing the selected capabilities mapped by their IDs.
 *   - roleCapabilitiesListIds: An array containing the IDs of the selected capabilities.
 *   - setSelectedCapabilitiesMap: A function to update the selected capabilities map.
 *   - isLoading: A boolean indicating if the capabilities are currently being loaded.
 */

export const useApplicationCapabilities = (checkedAppIdsMap, options = {}) => {
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

  useEffect(() => {
    if (!isCapabilitiesLoading) {
      const updatedSelectedCapabilitiesMap = getOnlyIntersectedWithApplicationsCapabilities(capabilities, roleCapabilitiesListIds);
      setSelectedCapabilitiesMap(updatedSelectedCapabilitiesMap);
    }
    // isCapabilitiesLoading only information we need to know if capabilities fetched
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapabilitiesLoading]);

  const memoizedCapabilities = useMemo(() => getCapabilitiesGroupedByTypeAndResource(capabilities), [capabilities]);

  return {
    capabilities: memoizedCapabilities,
    selectedCapabilitiesMap,
    roleCapabilitiesListIds,
    roleCapabilitiesListNames,
    setSelectedCapabilitiesMap,
    isLoading: isCapabilitiesLoading,
    queryKeys
  };
};
