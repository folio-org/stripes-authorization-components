import { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus, Button,
  ConfirmationModal,
  ExpandAllButton,
  Layer,
  Pane,
  PaneFooter,
  PaneHeader,
  Paneset,
  TextArea,
  TextField,
} from '@folio/stripes/components';

import { Pluggable } from '@folio/stripes/core';
import {
  CapabilitiesAccordion,
  CapabilitiesSetsAccordion,
} from '../../Capabilities';
import { getTypeActionCapSets, getUnselectedCapabilitySetCapabilities } from '../utils';
import { validateNoSlashCharacter, validateRoleName } from '../../utils/validations';

import css from '../style.css';

export const RoleForm = ({
  title,
  roleName,
  description,
  capabilities,
  isCapabilitySelected,
  isLoading,
  setRoleName,
  setDescription,
  onSubmit,
  onClose,
  onChangeCapabilityCheckbox,
  selectedCapabilitiesMap,
  onSaveSelectedApplications,
  checkedAppIdsMap,
  capabilitySets,
  capabilitySetsList,
  actionCapabilitySets,
  isCapabilitySetSelected,
  onChangeCapabilitySetCheckbox,
  isCapabilityDisabled,
  isCapabilitiesLoading,
  isCapabilitySetsLoading,
  unselectAllCapabilitiesAndSets,
  toggleCapabilitiesHeaderCheckbox,
  isAllActionCapabilitiesSelected,
  toggleCapabilitySetsHeaderCheckbox,
  isAllActionCapabilitySetsSelected,
  isUnselectApplicationConfirmationOpen,
  setIsUnselectApplicationConfirmationOpen,
  unselectedItemsInfo,
  applyAppIdsChanges
}) => {
  const [isUnselectCapabilitySetConfirmationOpen, setIsUnselectCapabilitySetConfirmationOpen] = useState({
    open: false,
    capabilitySetIds: [],
    unselectedCapabilityCount: 0,
    checked: false,
    type: null,
    action: null
  });

  const [isNameBlurred, setIsNameBlurred] = useState(false);

  const isNameInvalid = !!validateRoleName(roleName);

  // Give 'required' feedback only after the name field is blurred.
  const nameError = isNameBlurred ? validateRoleName(roleName) : validateNoSlashCharacter(roleName);

  const handleSubmit = (event) => {
    if (isNameInvalid) {
      event.preventDefault();
      setIsNameBlurred(true);
      return;
    }

    onSubmit(event);
  };

  /**
   * Handles the change event for the capability set checkbox.
   *
   * @param {object} event - The change event object from the checkbox.
   * @param {string} capabilitySetId - The ID of the capability set associated with the checkbox.
   */
  const handleCapabilitySetCheckbox = (event, capabilitySetId) => {
    const { checked } = event.target;

    if (checked) {
      onChangeCapabilitySetCheckbox(checked, capabilitySetId);
    } else {
      const unselectedAppInfo = getUnselectedCapabilitySetCapabilities(checkedAppIdsMap, capabilitySetsList, capabilities, [capabilitySetId], selectedCapabilitiesMap);

      setIsUnselectCapabilitySetConfirmationOpen({
        open: true,
        capabilitySetIds: [capabilitySetId],
        unselectedCapabilityCount: unselectedAppInfo.unselectedCapabilities?.size,
        checked
      });
    }
  };

  /**
   * Handles the change event for the capability sets header checkbox.
   *
   * @param {boolean} checked - The checked state of the checkbox.
   * @param {string} type - The type of the capability set.
   * @param {string} action - The action of the capability set.
   */
  const handleCapabilitySetsHeaderCheckbox = (checked, type, action) => {
    if (checked) {
      toggleCapabilitySetsHeaderCheckbox(checked, type, action);
    } else {
      const updatedCapabilitySetsMap = getTypeActionCapSets(actionCapabilitySets, type, action);

      const unselectedAppInfo = getUnselectedCapabilitySetCapabilities(checkedAppIdsMap, capabilitySetsList, capabilities, Object.keys(updatedCapabilitySetsMap), selectedCapabilitiesMap);

      setIsUnselectCapabilitySetConfirmationOpen({
        open: true,
        capabilitySetIds: Object.keys(updatedCapabilitySetsMap),
        unselectedCapabilityCount: unselectedAppInfo.unselectedCapabilities?.size,
        checked,
        type,
        action
      });
    }
  };

  /**
   * Gets the display names of capability sets based on their IDs.
   *
   * @param {string[]} ids - An array of capability set IDs.
   * @returns {string} A comma-separated string of display names.
   */
  const getCapabilitySetDisplayNamesByIds = (ids) => {
    return capabilitySetsList
      .filter(capabilitySet => ids.includes(capabilitySet.id))
      .map(capabilitySet => `${capabilitySet.resource} - ${capabilitySet.action}`)
      .join(', ');
  };

  const paneFooterRenderStart = (
    <Button
      marginBottom0
      buttonStyle="default mega"
      onClick={onClose}
    >
      <FormattedMessage id="stripes-authorization-components.crud.cancel" />
    </Button>
  );

  const paneFooterRenderEnd = (
    <Button
      marginBottom0
      buttonStyle="primary mega"
      disabled={isNameInvalid || isLoading}
      type="submit"
      onClick={handleSubmit}
    >
      <FormattedMessage id="stripes-components.saveAndClose" />
    </Button>
  );

  const intl = useIntl();

  return <form onSubmit={handleSubmit} data-testid="create-role-form">
    <Layer
      isOpen
      inRootSet
      contentLabel={intl.formatMessage({ id: title })}
    >
      <Paneset isRoot>
        <Pane
          centerContent
          defaultWidth="100%"
          footer={(
            <PaneFooter
              renderStart={paneFooterRenderStart}
              renderEnd={paneFooterRenderEnd}
            />
          )}
          renderHeader={renderProps => (
            <PaneHeader
              {...renderProps}
              paneTitle={intl.formatMessage({ id: title })}
              dismissible
              onClose={onClose}
            />
          )}
        >
          <AccordionStatus>
            <div className={css.alignRightWrapper}>
              <ExpandAllButton />
            </div>
            <AccordionSet>
              <Accordion label={<FormattedMessage id="stripes-authorization-components.generalInformation" />}>
                <TextField
                  required
                  value={roleName}
                  label={<FormattedMessage id="stripes-authorization-components.form.labels.name" />}
                  onChange={event => setRoleName(event.target.value)}
                  onBlur={() => setIsNameBlurred(true)}
                  onFocus={() => setIsNameBlurred(false)}
                  error={nameError}
                  data-testid="rolename-input"
                />
                <TextArea
                  value={description}
                  onBlur={event => setDescription(event.target.value)}
                  label={<FormattedMessage id="stripes-authorization-components.form.labels.description" />}
                  data-testid="description-input"
                />
              </Accordion>

              <Pluggable
                type="select-application"
                checkedAppIdsMap={checkedAppIdsMap}
                onSave={onSaveSelectedApplications}
                renderTrigger={props => (
                  <Button
                    {...props}
                    icon="plus-sign"
                    disabled={isLoading}
                  >
                    <FormattedMessage
                      id="stripes-authorization-components.crud.selectApplication"
                    />
                  </Button>
                )}
              >
                <FormattedMessage
                  id="stripes-authorization-components.applications.notAvailable"
                />
              </Pluggable>
              <ConfirmationModal
                id="unselect-application-confirmation-modal"
                open={isUnselectApplicationConfirmationOpen}
                onConfirm={() => {
                  setIsUnselectApplicationConfirmationOpen(false);
                  unselectedItemsInfo?.onCloseHandler();
                  applyAppIdsChanges(unselectedItemsInfo?.selectedAppIds);
                }}
                onCancel={() => setIsUnselectApplicationConfirmationOpen(false)}
                heading={<FormattedMessage id="stripes-authorization-components.warning" />}
                message={<FormattedMessage
                  id="stripes-authorization-components.applications.unselect.warning"
                  values={{
                    appNames: unselectedItemsInfo?.unselectedAppIds?.join(', '),
                    capabilitiesCount: unselectedItemsInfo?.unselectedCapabilityCount,
                    capabilitySetsCount: unselectedItemsInfo?.unselectedCapabilitySetCount
                  }}
                />}
                confirmLabel={<FormattedMessage id="stripes-core.button.continue" />}
              />
              <ConfirmationModal
                id="unselect-capability-set-confirmation-modal"
                open={isUnselectCapabilitySetConfirmationOpen.open}
                onConfirm={() => {
                  const { checked, type, action } = isUnselectCapabilitySetConfirmationOpen;
                  setIsUnselectCapabilitySetConfirmationOpen({ open: false, capabilitySetIds: [] });

                  // If type and action are defined, then capability sets header checkbox was clicked, otherwise single capability set checkbox was clicked
                  if (type && action) {
                    toggleCapabilitySetsHeaderCheckbox(checked, type, action);
                  } else {
                    const capabilitySetId = isUnselectCapabilitySetConfirmationOpen.capabilitySetIds[0];
                    onChangeCapabilitySetCheckbox(checked, capabilitySetId);
                  }
                }}
                onCancel={() => setIsUnselectCapabilitySetConfirmationOpen({ open: false, capabilitySetIds: [] })}
                heading={<FormattedMessage id="stripes-authorization-components.warning" />}
                message={<FormattedMessage
                  id="stripes-authorization-components.capabilitySets.unselect.warning"
                  values={{
                    capabilitySet: getCapabilitySetDisplayNamesByIds(isUnselectCapabilitySetConfirmationOpen.capabilitySetIds),
                    capabilitiesCount: isUnselectCapabilitySetConfirmationOpen.unselectedCapabilityCount,
                  }}
                />}
                confirmLabel={<FormattedMessage id="stripes-core.button.continue" />}
              />

              {!!unselectAllCapabilitiesAndSets && <Button
                disabled={isLoading}
                onClick={unselectAllCapabilitiesAndSets}
              >
                <FormattedMessage id="stripes-authorization-components.form.unassignAllCapabilities" />
              </Button>}

              <CapabilitiesSetsAccordion
                isCapabilitySetSelected={isCapabilitySetSelected}
                onChangeCapabilitySetCheckbox={handleCapabilitySetCheckbox}
                capabilitySets={capabilitySets}
                isLoading={isCapabilitySetsLoading}
                toggleCapabilitySetsHeaderCheckbox={handleCapabilitySetsHeaderCheckbox}
                isAllActionCapabilitySetsSelected={isAllActionCapabilitySetsSelected}
              />
              <CapabilitiesAccordion
                isCapabilitySelected={isCapabilitySelected}
                onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
                selectedCapabilitiesMap={selectedCapabilitiesMap}
                isCapabilityDisabled={isCapabilityDisabled}
                capabilities={capabilities}
                isLoading={isCapabilitiesLoading}
                toggleCapabilitiesHeaderCheckbox={toggleCapabilitiesHeaderCheckbox}
                isAllActionCapabilitiesSelected={isAllActionCapabilitiesSelected}
              />
            </AccordionSet>
          </AccordionStatus>
        </Pane>
      </Paneset>;
    </Layer>;
  </form>;
};

RoleForm.propTypes = {
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  title: PropTypes.string,
  roleName: PropTypes.string,
  setRoleName: PropTypes.func,
  description: PropTypes.string,
  setDescription: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilitySetSelected: PropTypes.func,
  onChangeCapabilityCheckbox: PropTypes.func,
  capabilities: PropTypes.object,
  capabilitySets: PropTypes.object,
  isLoading: PropTypes.bool,
  selectedCapabilitiesMap: PropTypes.object,
  onSaveSelectedApplications: PropTypes.func,
  onChangeCapabilitySetCheckbox: PropTypes.func,
  isCapabilityDisabled: PropTypes.func,
  checkedAppIdsMap: PropTypes.object,
  isCapabilitiesLoading: PropTypes.bool,
  isCapabilitySetsLoading: PropTypes.bool,
  unselectAllCapabilitiesAndSets: PropTypes.func,
  toggleCapabilitiesHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitiesSelected: PropTypes.func,
  toggleCapabilitySetsHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitySetsSelected: PropTypes.func,
};
