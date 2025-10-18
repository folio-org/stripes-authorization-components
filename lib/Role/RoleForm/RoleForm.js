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
      disabled={!roleName || isLoading}
      type="submit"
      onClick={onSubmit}
    >
      <FormattedMessage id="stripes-components.saveAndClose" />
    </Button>
  );

  const intl = useIntl();

  return <form onSubmit={onSubmit} data-testid="create-role-form">
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
                  data-testid="rolename-input"
                />
                <TextArea
                  value={description}
                  onChange={event => setDescription(event.target.value)}
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
              > <FormattedMessage
                id="stripes-authorization-components.applications.notAvailable"
              />
              </Pluggable>
              <ConfirmationModal
                id="unselect-application-confirmation-modal"
                open={isUnselectApplicationConfirmationOpen}
                onConfirm={() => applyAppIdsChanges(unselectedItemsInfo?.selectedAppIds)}
                onCancel={() => setIsUnselectApplicationConfirmationOpen(false)}
                heading={<FormattedMessage id="stripes-authorization-components.warning" />}
                message={<FormattedMessage id="stripes-authorization-components.applications.unselect.warning"
                  values={{
                    appNames: unselectedItemsInfo?.unselectedAppIds?.join(', '),
                    capabilityCount: unselectedItemsInfo?.unselectedCapabilityCount,
                    capabilitySetCount: unselectedItemsInfo?.unselectedCapabilitySetCount
                  }} />}
                confirmLabel={<FormattedMessage id="stripes-core.label.okay" />}
              />

              {!!unselectAllCapabilitiesAndSets && <Button
                disabled={isLoading}
                onClick={unselectAllCapabilitiesAndSets}
              >
                <FormattedMessage id="stripes-authorization-components.form.unassignAllCapabilities" />
              </Button>}

              <CapabilitiesSetsAccordion
                isCapabilitySetSelected={isCapabilitySetSelected}
                onChangeCapabilitySetCheckbox={onChangeCapabilitySetCheckbox}
                capabilitySets={capabilitySets}
                isLoading={isCapabilitySetsLoading}
                toggleCapabilitySetsHeaderCheckbox={toggleCapabilitySetsHeaderCheckbox}
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
