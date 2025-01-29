import keyBy from 'lodash/keyBy';
import { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import {
  getCapabilitiesGroupedByTypeAndResource,
} from '../../utils';
import { useChunkedApplicationCapabilitySets } from '../useChunkedApplicationCapabilitySets';

/**
 * Customhook that fetches and manages capability sets for a given list of checked application IDs.
 *
 * @param {Object} checkedAppIdsMap - An object mapping application IDs to boolean values indicating whether they are checked.
 *   Using this object, the hook will fetch the capability sets for the selected applications.
 * @param {Object} options - An object that could include tenantId and other information
 * @return {Object} An object containing the following properties:
 *   - capabilitySets: An object grouping capability sets by type and resource.
 *   - capabilitySetsList: An array of capability sets.
 *   - selectedCapabilitySetsMap: An object mapping capability set IDs to boolean values indicating whether they are selected.
 *   - setSelectedCapabilitySetsMap: A function to update the selected capability sets map.
 *   - roleCapabilitySetsListIds: An array of selected capability set IDs.
 *   - isLoading: A boolean indicating whether capability sets are currently being fetched.
 */

export const useApplicationCapabilitySets = (checkedAppIdsMap, options = {}) => {
  const { tenantId } = options;

  const selectedAppIds = Object.keys(checkedAppIdsMap);
  const {
    items: capabilitySets,
    isLoading: isCapabilitySetsLoading,
    queryKeys = [],
  } = useChunkedApplicationCapabilitySets(selectedAppIds, { tenantId });

  const [selectedCapabilitySetsMap, setSelectedCapabilitySetsMap] = useState({});
  const roleCapabilitySetsListIds = Object.keys(selectedCapabilitySetsMap);

  const roleCapabilitySetsListNames = useMemo(() => {
    const capabilitySetsMap = keyBy(capabilitySets, 'id');

    return roleCapabilitySetsListIds
      .map((capabilitySetId) => capabilitySetsMap[capabilitySetId]?.name)
      .filter(Boolean);
  }, [capabilitySets, roleCapabilitySetsListIds]);

  const memoizedCapabilitySets = useMemo(() => getCapabilitiesGroupedByTypeAndResource(capabilitySets), [capabilitySets]);

  const actionCapabilitySets = useMemo(() => {
    const initialStructure = { data: {}, settings: {}, procedural: {} };

    return capabilitySets.reduce((acc, { type, action, id }) => {
      if (!acc[type][action]) acc[type][action] = [];
      acc[type][action].push(id);

      return acc;
    }, initialStructure);
  }, [capabilitySets]);

  const checkedAppCapSets = useMemo(() => capabilitySets.reduce((acc, capSet) => {
    acc[capSet.id] = true;
    return acc;
  }, {}), [capabilitySets]);

  useEffect(() => {
    if (!isCapabilitySetsLoading && !isEmpty(checkedAppCapSets)) {
      setSelectedCapabilitySetsMap((prevCapSets) => {
        const copy = { ...prevCapSets };
        let hasChanged = false;

        for (const capSet in copy) {
          if (!(capSet in checkedAppCapSets)) {
            delete copy[capSet];
            hasChanged = true;
          }
        }

        return hasChanged ? copy : prevCapSets;
      });
    }
  }, [checkedAppCapSets, isCapabilitySetsLoading]);

  return {
    capabilitySets:memoizedCapabilitySets,
    capabilitySetsList: capabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    roleCapabilitySetsListNames,
    isLoading: isCapabilitySetsLoading,
    queryKeys,
    actionCapabilitySets
  };
};
