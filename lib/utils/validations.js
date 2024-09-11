import { FormattedMessage } from 'react-intl';

export function validateRequired(value) {
  return value ? undefined : <FormattedMessage id="stripes-acq-components.validation.required" />;
}
