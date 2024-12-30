import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Loading,
} from '@folio/stripes/components';

import { CapabilitiesSection } from '../CapabilitiesSection';

import css from '../style.css';

export const CapabilitiesSetsAccordion = ({
  capabilitySets,
  isCapabilitySetSelected,
  isLoading,
  onChangeCapabilitySetCheckbox,
  toggleCapabilitySetsHeaderCheckbox, isAllActionCapabilitySetsSelected
}) => {
  return (
    <Accordion
      label={(
        <>
          <FormattedMessage id="stripes-authorization-components.details.capabilitySets" />
          {isLoading && <span className={css.loadingInTitle}> <Loading /></span>}
        </>
      )}
    >
      <CapabilitiesSection
        readOnly={false}
        isCapabilitySelected={isCapabilitySetSelected}
        onChangeCapabilityCheckbox={onChangeCapabilitySetCheckbox}
        capabilities={capabilitySets}
        toggleCapabilitiesHeaderCheckbox={toggleCapabilitySetsHeaderCheckbox}
        isAllActionCapabilitiesSelected={isAllActionCapabilitySetsSelected}
      />
    </Accordion>
  );
};

CapabilitiesSetsAccordion.propTypes = {
  isCapabilitySetSelected: PropTypes.func,
  onChangeCapabilitySetCheckbox: PropTypes.func,
  capabilitySets: PropTypes.object,
  isLoading: PropTypes.bool,
  toggleCapabilitySetsHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitySetsSelected: PropTypes.func
};
