import PropTypes from 'prop-types';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { isEmpty } from 'lodash';

import { useQueryClient } from 'react-query';
import { MUTATION_ACTION_TYPE } from '../../constants';
import {
  useApplicationCapabilities,
  useApplicationCapabilitySets,
  useCreateRoleMutation,
  useRoleMutationErrorHandler,
  useShowCallout,
} from '../../hooks';
import { RoleForm } from '../RoleForm';
import { getCheckboxHandlers, changesForUnselect } from '../utils';

export const RoleCreate = ({
  path,
  tenantId,
}) => {
  const history = useHistory();
  const showCallout = useShowCallout();
  const queryClient = useQueryClient();
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [checkedAppIdsMap, setCheckedAppIdsMap] = useState({});
  const [disabledCapabilities, setDisabledCapabilities] = useState({});
  const [isUnselectApplicationConfirmationOpen, setIsUnselectApplicationConfirmationOpen] = useState(false);
  const [unselectedItemsInfo, setUnselectedItemsInfo] = useState({});

  const {
    capabilities,
    selectedCapabilitiesMap,
    setSelectedCapabilitiesMap,
    roleCapabilitiesListIds,
    isLoading: isAppCapabilitiesLoading,
    queryKeys: applicationCapabilitiesQueryKeys,
    actionCapabilities
  } = useApplicationCapabilities({ checkedAppIdsMap,
    options:{ tenantId },
    setDisabledCapabilities });

  const {
    capabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    capabilitySetsList,
    isLoading: isAppCapabilitySetsLoading,
    queryKeys: applicationCapabilitySetsQueryKeys,
    actionCapabilitySets
  } = useApplicationCapabilitySets({ checkedAppIdsMap, options: { tenantId } });

  const { handleError } = useRoleMutationErrorHandler();

  const {
    onChangeCapabilityCheckbox,
    onChangeCapabilitySetCheckbox,
    toggleCapabilitiesHeaderCheckbox,
    isAllActionCapabilitiesSelected,
    isAllActionCapabilitySetsSelected,
    toggleCapabilitySetsHeaderCheckbox,
  } = getCheckboxHandlers({
    selectedCapabilitiesMap,
    setSelectedCapabilitiesMap,
    capabilitySetsList,
    setDisabledCapabilities,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    actionCapabilities,
    disabledCapabilities,
    actionCapabilitySets,
  });

  const isCapabilitySetSelected = id => !!selectedCapabilitySetsMap[id];
  const isCapabilityDisabled = id => !!disabledCapabilities[id];
  /* disabled means that capability is included in the some of the capability set,
  and not interactively selected. And we show that capabilities as disabled and selected in the UI,
  instead of storing them in the selected capabilities
  */
  const isCapabilitySelected = id => !!selectedCapabilitiesMap[id] || isCapabilityDisabled(id);

  const { mutateRole, isLoading } = useCreateRoleMutation(
    roleCapabilitiesListIds,
    roleCapabilitySetsListIds,
    null,
    { tenantId },
  );

  const cleanupQueries = () => {
    queryClient.removeQueries({ queryKey: applicationCapabilitiesQueryKeys.flat() });
    queryClient.removeQueries({ queryKey: applicationCapabilitySetsQueryKeys.flat() });
  };

  const onClose = () => {
    cleanupQueries();
    history.push(path);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const { id: roleId } = await mutateRole({ name: roleName, description });
      cleanupQueries();
      history.push(`${path}/${roleId}`);
      showCallout({ messageId: 'stripes-authorization-components.role.create.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.create, error);
    }
  };

  const unselectAllCapabilitiesAndSets = () => {
    setSelectedCapabilitiesMap({});
    setSelectedCapabilitySetsMap({});
    setDisabledCapabilities({});
  };

  const applyAppIdsChanges = (appIds) => {
    if (isEmpty(appIds)) {
      unselectAllCapabilitiesAndSets();
    }
    setCheckedAppIdsMap(appIds);
  };

  const onSubmitSelectApplications = (selectedAppIds, onCloseHandler) => {
    const unselectedAppInfo = changesForUnselect(selectedAppIds, checkedAppIdsMap,
      capabilities, capabilitySets, selectedCapabilitiesMap, selectedCapabilitySetsMap);

    if (unselectedAppInfo.isConfirmationNeeded) {
      setUnselectedItemsInfo({ ...unselectedAppInfo, selectedAppIds, onCloseHandler });
      setIsUnselectApplicationConfirmationOpen(true);
    } else if (onCloseHandler) { // Changes can be applied directly if no capabilities or capability sets would be unselected
      applyAppIdsChanges(selectedAppIds);
      onCloseHandler();
    }
  };

  return (
    <RoleForm
      title="stripes-authorization-components.crud.createRole"
      roleName={roleName}
      description={description}
      isLoading={isLoading}
      capabilities={capabilities}
      capabilitySets={capabilitySets}
      isCapabilityDisabled={isCapabilityDisabled}
      isCapabilitySetSelected={isCapabilitySetSelected}
      isCapabilitySelected={isCapabilitySelected}
      setRoleName={setRoleName}
      setDescription={setDescription}
      onSubmit={onSubmit}
      onClose={onClose}
      onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
      onChangeCapabilitySetCheckbox={onChangeCapabilitySetCheckbox}
      selectedCapabilitiesMap={selectedCapabilitiesMap}
      onSaveSelectedApplications={onSubmitSelectApplications}
      checkedAppIdsMap={checkedAppIdsMap}
      isCapabilitiesLoading={isAppCapabilitiesLoading}
      isCapabilitySetsLoading={isAppCapabilitySetsLoading}
      toggleCapabilitiesHeaderCheckbox={toggleCapabilitiesHeaderCheckbox}
      isAllActionCapabilitiesSelected={isAllActionCapabilitiesSelected}
      toggleCapabilitySetsHeaderCheckbox={toggleCapabilitySetsHeaderCheckbox}
      isAllActionCapabilitySetsSelected={isAllActionCapabilitySetsSelected}
      isUnselectApplicationConfirmationOpen={isUnselectApplicationConfirmationOpen}
      setIsUnselectApplicationConfirmationOpen={setIsUnselectApplicationConfirmationOpen}
      unselectedItemsInfo={unselectedItemsInfo}
      applyAppIdsChanges={applyAppIdsChanges}
    />
  );
};

RoleCreate.propTypes = {
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
