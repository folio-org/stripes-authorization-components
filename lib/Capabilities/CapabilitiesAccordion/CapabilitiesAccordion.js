import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Loading,
} from '@folio/stripes/components';

import { CapabilitiesSection } from '../CapabilitiesSection';

import css from '../style.css';

export const CapabilitiesAccordion = ({
  isCapabilitySelected,
  onChangeCapabilityCheckbox,
  isCapabilityDisabled,
  capabilities,
  isLoading,
  toggleCapabilitiesHeaderCheckbox,
  isAllActionCapabilitiesSelected
}) => {
  return (
    <Accordion
      label={(
        <>
          <FormattedMessage id="stripes-authorization-components.details.capabilities" />
          {isLoading && <span className={css.loadingInTitle}> <Loading /></span>}
        </>
      )}
    >
      <CapabilitiesSection
        readOnly={false}
        isCapabilitySelected={isCapabilitySelected}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        capabilities={capabilities}
        isCapabilityDisabled={isCapabilityDisabled}
        toggleCapabilitiesHeaderCheckbox={toggleCapabilitiesHeaderCheckbox}
        isAllActionCapabilitiesSelected={isAllActionCapabilitiesSelected}
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
  isCapabilitySelected: PropTypes.func,
  onChangeCapabilityCheckbox: PropTypes.func,
  capabilities: PropTypes.object,
  isCapabilityDisabled: PropTypes.func,
  isLoading: PropTypes.bool,
  toggleCapabilitiesHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitiesSelected: PropTypes.func,
};
