import keyBy from 'lodash/keyBy';
import { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import {
  getCapabilitiesGroupedByTypeAndResource,
} from '../../utils';
import { useChunkedApplicationCapabilitySets } from '../useChunkedApplicationCapabilitySets';

/**
 * Custom hook that fetches and manages capability sets for a given list of checked application IDs.
 *
 * @param {Object} checkedAppIdsMap - An object mapping application IDs to boolean values indicating whether they are checked.
 *   Using this object, the hook will fetch the capability sets for the selected applications.
 * @param {Object} options - An object that could include tenantId and other information
 * @param {Function} filter - A function used as a client-side filter for capability sets. Should return a boolean.
 * @return {Object} An object containing the following properties:
 *   - capabilitySets: An object grouping capability sets by type and resource.
 *   - capabilitySetsList: An array of capability sets.
 *   - selectedCapabilitySetsMap: An object mapping capability set IDs to boolean values indicating whether they are selected.
 *   - setSelectedCapabilitySetsMap: A function to update the selected capability sets map.
 *   - roleCapabilitySetsListIds: An array of selected capability set IDs.
 *   - isLoading: A boolean indicating whether capability sets are currently being fetched.
 */

// seting defaultFilter as const to avoid creating a new function on every render.
const defaultFilter = (_capabilitySet) => true;

export const useApplicationCapabilitySets = ({ checkedAppIdsMap, options = {}, filter = defaultFilter }) => {
  const { tenantId } = options;

  const selectedAppIds = Object.keys(checkedAppIdsMap);
  const {
    items: capabilitySets,
    isLoading: isCapabilitySetsLoading,
    queryKeys = [],
  } = useChunkedApplicationCapabilitySets(selectedAppIds, { tenantId });

  const filteredCapabilitySets = useMemo(() => {
    return capabilitySets ? capabilitySets.filter(filter) : [];
  }, [capabilitySets, filter]);

  const [selectedCapabilitySetsMap, setSelectedCapabilitySetsMap] = useState({});
  const roleCapabilitySetsListIds = Object.keys(selectedCapabilitySetsMap);

  const roleCapabilitySetsListNames = useMemo(() => {
    const capabilitySetsMap = keyBy(filteredCapabilitySets, 'id');

    return roleCapabilitySetsListIds
      .map((capabilitySetId) => capabilitySetsMap[capabilitySetId]?.name)
      .filter(Boolean);
  }, [roleCapabilitySetsListIds, filteredCapabilitySets]);

  const memoizedCapabilitySets = useMemo(() => getCapabilitiesGroupedByTypeAndResource(filteredCapabilitySets), [filteredCapabilitySets]);

  const actionCapabilitySets = useMemo(() => {
    const initialStructure = { data: {}, settings: {}, procedural: {} };

    return filteredCapabilitySets.reduce((acc, { type, action, id }) => {
      if (!acc[type][action]) acc[type][action] = [];
      acc[type][action].push(id);

      return acc;
    }, initialStructure);
  }, [filteredCapabilitySets]);

  const checkedAppCapSets = useMemo(
    () => filteredCapabilitySets.reduce((acc, capSet) => {
      acc[capSet.id] = true;
      return acc;
    }, {}),
    [filteredCapabilitySets],
  );

  /*
    What happens in useEffect?
    Our useApplicationCapabilitySets hook receives a list of the selected applications as argument,
    and we retrieve the capability sets ONLY for the selected applications.
    The user will then be able to select from the provided capabilitySets.
    useEffect handles the situation where the user changes the selected applications, causing new capabilitySets to be retrieved.
    However, previously selected capability sets may no longer be present in the new list of selected application capability sets.
    It filters them by checking whether the selected capability set is included in the new list of capabilitySets.
    It iterates over selectedCapabilitySets, and if any of them are not in the new list of capabilitySets, they are removed.
    Example,
      const selectedCapabilitiesMap = { id1: true, id2: true },
            checkedAppCapSets = { id1: true };
     Since checkedAppCapSets does not include id2, it is removed from selectedCapabilitySetsMap.
   */

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
    capabilitySets: memoizedCapabilitySets,
    capabilitySetsList: filteredCapabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    roleCapabilitySetsListNames,
    isLoading: isCapabilitySetsLoading,
    queryKeys,
    actionCapabilitySets,
  };
};
