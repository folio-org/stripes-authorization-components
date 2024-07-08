import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';

import { CapabilitiesDataType } from '../CapabilitiesDataType';
import { CapabilitiesProcedural } from '../CapabilitiesProcedural';
import { CapabilitiesSettings } from '../CapabilitiesSettings';
import { capabilitiesPropType } from '../constants';

/**
 * Renders the CapabilitiesSection component.
 *
 * @param {Object} capabilities - the capabilities object with keys 'data', 'settings' and 'procedural'
 * @param {boolean} readOnly - indicates if the component is read-only
 * @param {Function} onChangeCapabilityCheckbox - the callback function for when capability checkbox is changed
 * @param {Function} isCapabilitySelected - the callback function to check if capability is selected,
 * @param capabilitiesToCompare - the array of object with keys 'data', 'settings' and 'procedural' used to compare with rendered capabilities
 * @param {boolean} isNeedToCompare - indicates if need to compare capabilities
 * @return {JSX.Element} - the rendered CapabilitiesSection component
 */

export const CapabilitiesSection = ({
  capabilities,
  readOnly,
  onChangeCapabilityCheckbox,
  isCapabilitySelected,
  isCapabilityDisabled,
  capabilitiesToCompare = [],
  isNeedToCompare = false,
}) => {
  return (
    <section>
      {!isEmpty(capabilities.data) && (
      <CapabilitiesDataType
        isCapabilityDisabled={isCapabilityDisabled}
        isCapabilitySelected={isCapabilitySelected}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        readOnly={readOnly}
        capabilitiesToCompare={capabilitiesToCompare}
        isNeedToCompare={isNeedToCompare}
        content={capabilities.data}
      />
      )}
      {!isEmpty(capabilities.settings) && (
      <CapabilitiesSettings
        isCapabilityDisabled={isCapabilityDisabled}
        isCapabilitySelected={isCapabilitySelected}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        readOnly={readOnly}
        capabilitiesToCompare={capabilitiesToCompare}
        isNeedToCompare={isNeedToCompare}
        content={capabilities.settings}
      />
      )}
      {!isEmpty(capabilities.procedural) && (
      <CapabilitiesProcedural
        isCapabilityDisabled={isCapabilityDisabled}
        isCapabilitySelected={isCapabilitySelected}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        readOnly={readOnly}
        capabilitiesToCompare={capabilitiesToCompare}
        isNeedToCompare={isNeedToCompare}
        content={capabilities.procedural}
      />
      )}
    </section>
  );
};

CapabilitiesSection.propTypes = {
  capabilities: PropTypes.object.isRequired,
  capabilitiesToCompare: capabilitiesPropType,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func,
  isNeedToCompare: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  readOnly: PropTypes.bool,
};
