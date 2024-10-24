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

  const {
    capabilities,
    selectedCapabilitiesMap,
    setSelectedCapabilitiesMap,
    roleCapabilitiesListIds,
    isLoading: isAppCapabilitiesLoading,
    queryKeys: applicationCapabilitiesQueryKeys
  } = useApplicationCapabilities(checkedAppIdsMap, { tenantId });

  const {
    capabilitySets,
    selectedCapabilitySetsMap,
    setSelectedCapabilitySetsMap,
    roleCapabilitySetsListIds,
    capabilitySetsList,
    isLoading: isAppCapabilitySetsLoading,
    queryKeys: applicationCapabilitySetsQueryKeys
  } = useApplicationCapabilitySets(checkedAppIdsMap, { tenantId });

  const { handleError } = useRoleMutationErrorHandler();

  const onChangeCapabilityCheckbox = (event, id) => setSelectedCapabilitiesMap({ ...selectedCapabilitiesMap, [id]: event.target.checked });
  const onChangeCapabilitySetCheckbox = (event, capabilitySetId) => {
    const selectedCapabilitySet = capabilitySetsList.find(cap => cap.id === capabilitySetId);
    if (!selectedCapabilitySet) return;

    const capabilitySetsCap = selectedCapabilitySet.capabilities.reduce((obj, item) => {
      obj[item] = event.target.checked;
      return obj;
    }, {});

    setDisabledCapabilities({ ...disabledCapabilities, ...capabilitySetsCap });
    setSelectedCapabilitySetsMap({ ...selectedCapabilitySetsMap, [capabilitySetId]: event.target.checked });
  };

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

  const onSubmitSelectApplications = (appIds, callback) => {
    if (callback) {
      callback();
    }
    if (isEmpty(appIds)) {
      setSelectedCapabilitiesMap({});
      setSelectedCapabilitySetsMap({});
      setDisabledCapabilities({});
    }
    setCheckedAppIdsMap(appIds);
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
    />
  );
};

RoleCreate.propTypes = {
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
