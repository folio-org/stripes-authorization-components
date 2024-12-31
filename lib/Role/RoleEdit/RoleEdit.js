import { isEmpty, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams, useHistory } from 'react-router-dom';

import { useStripes } from '@folio/stripes/core';

import { MUTATION_ACTION_TYPE } from '../../constants';
import {
  useApplicationCapabilities,
  useApplicationCapabilitySets,
  useEditRoleMutation,
  useRoleById,
  useRoleCapabilities,
  useRoleCapabilitySets,
  useRoleMutationErrorHandler,
  useRoleSharing,
  useShowCallout,
} from '../../hooks';
import { isShared } from '../../utils';
import { RoleForm } from '../RoleForm';
import { useCheckboxHandlers } from '../utils';

export const RoleEdit = ({ path, tenantId }) => {
  const history = useHistory();
  const { id: roleId } = useParams();
  const queryClient = useQueryClient();
  const stripes = useStripes();
  const showCallout = useShowCallout();
  const { handleError } = useRoleMutationErrorHandler();

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
    roleCapabilitiesListNames,
    isLoading: isAppCapabilitiesLoading,
    queryKeys: applicationCapabilitiesQueryKeys,
    actionCapabilities
  } = useApplicationCapabilities(checkedAppIdsMap, { tenantId });

  const {
    capabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    roleCapabilitySetsListNames,
    capabilitySetsList,
    isLoading: isAppCapabilitySetsLoading,
    queryKeys: applicationCapabilitySetsQueryKeys,
    actionCapabilitySets
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

  const isRoleShared = Boolean(stripes.hasInterface('consortia') && isShared(roleDetails));
  const shouldUpdateCapabilities = !isEqual(initialRoleCapabilitiesSelectedMap, selectedCapabilitiesMap);
  const shouldUpdateCapabilitySets = !isEqual(initialRoleCapabilitySetsSelectedMap, selectedCapabilitySetsMap);

  const {
    onChangeCapabilityCheckbox,
    onChangeCapabilitySetCheckbox,
    toggleCapabilitiesHeaderCheckbox,
    isAllActionCapabilitiesSelected,
    isAllActionCapabilitySetsSelected,
    toggleCapabilitySetsHeaderCheckbox,
  } = useCheckboxHandlers({
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

  const isCapabilityDisabled = (id) => !!disabledCapabilities[id];
  /* disabled means that capability is included in some of the capability set,
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

  const cleanupQueries = () => {
    queryClient.removeQueries({ queryKey: applicationCapabilitiesQueryKeys.flat() });
    queryClient.removeQueries({ queryKey: applicationCapabilitySetsQueryKeys.flat() });
  };

  const onClose = () => {
    cleanupQueries();
    history.push(`${path}/${roleId}`);
  };

  const roleData = {
    id: roleId,
    name: roleName,
    description,
  };
  const updateIndicators = {
    shouldUpdateCapabilities,
    shouldUpdateCapabilitySets,
  };

  const {
    isLoading: isRoleMutating,
    mutateRole,
  } = useEditRoleMutation(
    roleData,
    { roleCapabilitiesListIds, roleCapabilitySetsListIds, ...updateIndicators },
    { tenantId },
  );

  const {
    isLoading: isRoleSharing,
    upsertSharedRole,
  } = useRoleSharing();

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isRoleShared) {
        await upsertSharedRole({
          role: { ...roleDetails, ...roleData },
          ...updateIndicators,
          capabilityNames: roleCapabilitiesListNames,
          capabilitySetNames: roleCapabilitySetsListNames,
        });
      } else {
        await mutateRole();
      }

      onClose();
      showCallout({ messageId: 'stripes-authorization-components.role.edit.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.update, error);
    }
  };

  const isInitialDataReady = isInitialRoleCapabilitySetsLoaded && isInitialRoleCapabilitiesLoaded;
  const isLoading = isRoleMutating || isRoleSharing;

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
      toggleCapabilitiesHeaderCheckbox={toggleCapabilitiesHeaderCheckbox}
      isAllActionCapabilitiesSelected={isAllActionCapabilitiesSelected}
      toggleCapabilitySetsHeaderCheckbox={toggleCapabilitySetsHeaderCheckbox}
      isAllActionCapabilitySetsSelected={isAllActionCapabilitySetsSelected}
    />
  );
};

RoleEdit.propTypes = {
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
