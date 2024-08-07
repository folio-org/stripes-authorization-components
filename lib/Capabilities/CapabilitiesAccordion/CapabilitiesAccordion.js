import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Button,
  Loading,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import { CapabilitiesSection } from '../CapabilitiesSection';

import css from '../style.css';

export const CapabilitiesAccordion = ({
  checkedAppIdsMap,
  onSaveSelectedApplications,
  isCapabilitySelected,
  onChangeCapabilityCheckbox,
  isCapabilityDisabled,
  capabilities,
  isLoading,
}) => {
  return (
    <Accordion
      label={(
        <>
          <FormattedMessage id="stripes-authorization-components.details.capabilities" />
          {isLoading && <span className={css.loadingInTitle}> <Loading /></span>}
        </>
    )}
      displayWhenOpen={
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
              <FormattedMessage id="stripes-authorization-components.crud.selectApplication" />
            </Button>
          )}
        />
      }
    >
      <CapabilitiesSection
        readOnly={false}
        isCapabilitySelected={isCapabilitySelected}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        capabilities={capabilities}
        isCapabilityDisabled={isCapabilityDisabled}
      />
      {!isLoading && (
        <p id="asterisk-policy-desc">
          <FormattedMessage id="stripes-authorization-components.details.nonSinglePolicyText" />
        </p>
      )}
    </Accordion>
  );
};

CapabilitiesAccordion.propTypes = {
  checkedAppIdsMap: PropTypes.object,
  onSaveSelectedApplications: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  onChangeCapabilityCheckbox: PropTypes.func,
  capabilities: PropTypes.object,
  isCapabilityDisabled: PropTypes.func,
  setCapabilitiesRendered: PropTypes.func,
  isLoading: PropTypes.bool,
};
