import { isEmpty, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import {
  useApplicationCapabilities,
  useApplicationCapabilitySets,
  useEditRoleMutation,
  useErrorCallout,
  useRoleById,
  useRoleCapabilities,
  useRoleCapabilitySets,
} from '../../hooks';
import { RoleForm } from '../RoleForm';

export const RoleEdit = ({ path, tenantId }) => {
  const history = useHistory();
  const { id: roleId } = useParams();
  const queryClient = useQueryClient();

  const { roleDetails, isSuccess: isRoleDetailsLoaded } = useRoleById(roleId, { tenantId });

  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');

  const {
    initialRoleCapabilitiesSelectedMap,
    isSuccess: isInitialRoleCapabilitiesLoaded,
    capabilitiesAppIds
  } = useRoleCapabilities(roleId, tenantId);

  const [checkedAppIdsMap, setCheckedAppIdsMap] = useState({});
  const [disabledCapabilities, setDisabledCapabilities] = useState({});

  const {
    initialRoleCapabilitySetsSelectedMap,
    capabilitySetsCapabilities,
    isSuccess: isInitialRoleCapabilitySetsLoaded,
    capabilitySetsAppIds,
  } = useRoleCapabilitySets(roleId, tenantId);

  const {
    capabilities,
    selectedCapabilitiesMap,
    setSelectedCapabilitiesMap,
    roleCapabilitiesListIds,
    isLoading: isAppCapabilitiesLoading,
    queryKeys: applicationCapabilitiesQueryKeys,
  } = useApplicationCapabilities(checkedAppIdsMap, { tenantId });

  const {
    capabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    capabilitySetsList,
    isLoading: isAppCapabilitySetsLoading,
    queryKeys: applicationCapabilitySetsQueryKeys,
  } = useApplicationCapabilitySets(checkedAppIdsMap, { tenantId });

  const unselectAllCapabilitiesAndSets = () => {
    setSelectedCapabilitiesMap({});
    setSelectedCapabilitySetsMap({});
    setDisabledCapabilities({});
  };

  const onSubmitSelectApplications = (appIds, onCloseHandler) => {
    if (onCloseHandler) {
      onCloseHandler();
    }
    if (isEmpty(appIds)) {
      unselectAllCapabilitiesAndSets();
    }
    setCheckedAppIdsMap(appIds);
  };

  const { sendErrorCallout } = useErrorCallout();

  const shouldUpdateCapabilities = !isEqual(initialRoleCapabilitiesSelectedMap, selectedCapabilitiesMap);
  const shouldUpdateCapabilitySets = !isEqual(initialRoleCapabilitySetsSelectedMap, selectedCapabilitySetsMap);

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
    const selectedCapabilitySet = capabilitySetsList.find(cap => cap.id === capabilitySetId);
    if (!selectedCapabilitySet) return;

    const capabilitySetsCap = selectedCapabilitySet.capabilities.reduce((obj, item) => {
      obj[item] = event.target.checked;
      return obj;
    }, {});

    setDisabledCapabilities({ ...disabledCapabilities, ...capabilitySetsCap });
    // If checked set selected capability set id to true {foo: true}
    // If unchecked remove selected capability set id from selectedCapabilitySetsMap {} instead of {foo: false}
    const newSelectedCapabilitySetsMap = { ...selectedCapabilitySetsMap };

    if (event.target.checked) {
      newSelectedCapabilitySetsMap[capabilitySetId] = true;
    } else {
      delete newSelectedCapabilitySetsMap[capabilitySetId];
    }

    setSelectedCapabilitySetsMap(newSelectedCapabilitySetsMap);
  };

  const isCapabilityDisabled = id => !!disabledCapabilities[id];
  /* disabled means that capability is included in the some of the capability set,
  and not interactively selected. And we show that capabilities as disabled and selected in the UI,
  instead of storing them in the selected capabilities
  */
  const isCapabilitySelected = (id) => !!selectedCapabilitiesMap[id] || isCapabilityDisabled(id);
  const isCapabilitySetSelected = id => !!selectedCapabilitySetsMap[id];

  useEffect(() => {
    if (isRoleDetailsLoaded && roleDetails) {
      setRoleName(roleDetails.name);
      setDescription(roleDetails.description);
    }
  }, [isRoleDetailsLoaded, roleDetails]);

  const onClose = () => {
    queryClient.removeQueries({ queryKey: [...applicationCapabilitiesQueryKeys, ...applicationCapabilitySetsQueryKeys] });
    history.push(`${path}/${roleId}`);
  };

  const { mutateRole, isLoading } = useEditRoleMutation(
    { id: roleId, name: roleName, description },
    { roleCapabilitiesListIds, shouldUpdateCapabilities, roleCapabilitySetsListIds, shouldUpdateCapabilitySets },
    { handleError: sendErrorCallout, tenantId },
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    await mutateRole();
    onClose();
  };

  const isInitialDataReady = isInitialRoleCapabilitySetsLoaded && isInitialRoleCapabilitiesLoaded;

  useEffect(() => {
    if (isInitialDataReady) {
      // Define the selected applications and capability sets based on role ID
      // and installed applications. We update checkedAppIdsMap,
      // which triggers useChunkedApplicationCapabilities and useChunkedApplicationCapabilitySets
      // to fetch the actual data for the tables.

      setCheckedAppIdsMap({ ...capabilitiesAppIds, ...capabilitySetsAppIds });
      setSelectedCapabilitiesMap({ ...initialRoleCapabilitiesSelectedMap });
      setSelectedCapabilitySetsMap({ ...initialRoleCapabilitySetsSelectedMap });
      setDisabledCapabilities({ ...capabilitySetsCapabilities });
    }
    /* isInitialDataReady is enough to know if capabilities,capability sets fetched and can be settled safely to local state */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialDataReady]);

  return (
    <RoleForm
      title="stripes-authorization-components.crud.editRole"
      roleName={roleName}
      description={description}
      capabilities={capabilities}
      capabilitySets={capabilitySets}
      checkedAppIdsMap={checkedAppIdsMap}
      isLoading={isLoading || !isInitialDataReady || !isRoleDetailsLoaded}
      isCapabilitySelected={isCapabilitySelected}
      isCapabilityDisabled={isCapabilityDisabled}
      isCapabilitySetSelected={isCapabilitySetSelected}
      setRoleName={setRoleName}
      setDescription={setDescription}
      onSubmit={onSubmit}
      onClose={onClose}
      onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
      onChangeCapabilitySetCheckbox={onChangeCapabilitySetCheckbox}
      onSaveSelectedApplications={onSubmitSelectApplications}
      isCapabilitiesLoading={isAppCapabilitiesLoading || !isInitialRoleCapabilitiesLoaded}
      isCapabilitySetsLoading={isAppCapabilitySetsLoading || !isInitialRoleCapabilitySetsLoaded}
      unselectAllCapabilitiesAndSets={unselectAllCapabilitiesAndSets}
    />
  );
};

RoleEdit.propTypes = {
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
