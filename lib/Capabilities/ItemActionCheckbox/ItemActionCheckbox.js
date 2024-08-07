import PropTypes from 'prop-types';

import { NoValue } from '@folio/stripes/components';

import { CheckboxWithAsterisk } from '../CheckboxWithAsterisk';
import { useCheckboxAriaStates } from './hooks';

export const ItemActionCheckbox = ({
  item,
  action,
  onChangeCapabilityCheckbox,
  readOnly,
  isCapabilitySelected,
  isCapabilityDisabled,
}) => {
  const { getCheckboxAriaLabel } = useCheckboxAriaStates();
  const checked = isCapabilitySelected(item.actions[action]);

  if (!readOnly && !item.actions[action]) return null;

  if (readOnly && !checked) return <NoValue />;

  return (
    <CheckboxWithAsterisk
      aria-describedby="asterisk-policy-desc"
      aria-label={getCheckboxAriaLabel(action, item.resource)}
      onChange={event => {
        if (onChangeCapabilityCheckbox) {
          onChangeCapabilityCheckbox(event, item.actions[action]);
        }
      }}
      readOnly={readOnly || isCapabilityDisabled?.(item.actions[action])}
      checked={isCapabilitySelected(item.actions[action])}
    />
  );
};

ItemActionCheckbox.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string,
    resource: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
    actions: PropTypes.object,
  }),
  action: PropTypes.string.isRequired,
  onChangeCapabilityCheckbox: PropTypes.func,
  readOnly: PropTypes.bool,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func,
};
