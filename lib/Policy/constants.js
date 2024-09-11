import { FormattedMessage } from 'react-intl';

export const POLICY_TYPES = {
  user: 'USER',
  time: 'TIME',
  role: 'ROLE',
};

export const SOURCE_TYPES = {
  system: 'SYSTEM',
  user: 'USER',
  consortium: 'CONSORTIUM',
};

export const POLICY_TYPES_OPTIONS = Object.entries(POLICY_TYPES).map(([key, value]) => ({
  label: <FormattedMessage id={`stripes-authorization-components.form.labels.policyType.${key}`} />,
  value,
}));

export const SOURCE_TYPES_OPTIONS = Object.entries(SOURCE_TYPES).map(([key, value]) => ({
  label: <FormattedMessage id={`stripes-authorization-components.form.labels.sourceType.${key}`} />,
  value,
}));

export const FORM_FIELDS = {
  description: 'description',
  name: 'name',
  source: 'source',
  type: 'type',
};
