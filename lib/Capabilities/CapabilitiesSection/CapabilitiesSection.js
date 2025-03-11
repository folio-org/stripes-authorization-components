import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';

import { capabilitiesPropType, capabilityTypes } from '../constants';
import { CapabilitiesGrid } from '../CapabilitiesGrid';

/**
 * Renders the CapabilitiesSection component.
 *
 * @param {Object} capabilities - the capabilities object with keys 'data', 'settings' and 'procedural'
 * @param {boolean} readOnly - indicates if the component is read-only
 * @param {Function} onChangeCapabilityCheckbox - the callback function for when capability checkbox is changed
 * @param {Function} isCapabilitySelected - the callback function to check if capability is selected,
 * @param {Function} isCapabilityDisabled - the callback function to check if capability checkbox should be disabled,
 * @param capabilitiesToCompare - the array of object with keys 'data', 'settings' and 'procedural' used to compare with rendered capabilities
 * @param {boolean} isNeedToCompare - indicates if needed to compare capabilities
 * @param {Function} toggleCapabilitiesHeaderCheckbox - the callback function to check every capability/set based on header
 * @param {Function } isAllActionCapabilitiesSelected - indicates if column header is checked
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
  toggleCapabilitiesHeaderCheckbox,
  isAllActionCapabilitiesSelected
}) => {
  return (
    <section>
      {capabilityTypes.map(capabilityType => {
        if (isEmpty(capabilities[capabilityType])) { return null; }

        return <CapabilitiesGrid
          key={capabilityType}
          isCapabilityDisabled={isCapabilityDisabled}
          isCapabilitySelected={isCapabilitySelected}
          onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
          readOnly={readOnly}
          capabilitiesToCompare={capabilitiesToCompare[capabilityType]}
          isNeedToCompare={isNeedToCompare}
          content={capabilities[capabilityType]}
          type={capabilityType}
          toggleCapabilitiesHeaderCheckbox={toggleCapabilitiesHeaderCheckbox}
          isAllActionCapabilitiesSelected={isAllActionCapabilitiesSelected}
        />;
      })}
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
  toggleCapabilitiesHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitiesSelected: PropTypes.func,
};
