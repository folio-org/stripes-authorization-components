import { FormattedMessage } from 'react-intl';

export function validateRequired(value) {
  return value ? undefined : <FormattedMessage id="stripes-core.label.missingRequiredField" />;
}

export function validateNoSlashCharacter(value) {
  return value?.includes('/')
    ? <FormattedMessage id="stripes-authorization-components.form.errors.name.invalidCharacter" />
    : undefined;
}

export function validateRoleName(value) {
  return validateRequired(value) || validateNoSlashCharacter(value);
}
