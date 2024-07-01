import PropTypes from 'prop-types';
import { defineMessage } from 'react-intl';

export const capabilitiesPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string,
    resource: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
    actions: PropTypes.object,
  }),
);

export const CAPABILITIES_COLUMN_NAMES = {
  application: 'application',
  execute: 'execute',
  resource: 'resource',
  view: 'view',
  edit: 'edit',
  create: 'create',
  delete: 'delete',
  manage: 'manage',
  empty: '',
};

export const columnWidths = {
  [CAPABILITIES_COLUMN_NAMES.application]: '40%',
  [CAPABILITIES_COLUMN_NAMES.resource]: '24%',
  [CAPABILITIES_COLUMN_NAMES.view]: '6%',
  [CAPABILITIES_COLUMN_NAMES.edit]: '6%',
  [CAPABILITIES_COLUMN_NAMES.create]: '6%',
  [CAPABILITIES_COLUMN_NAMES.delete]: '6%',
  [CAPABILITIES_COLUMN_NAMES.manage]: '6%',
};

export const visibleColumns = [
  CAPABILITIES_COLUMN_NAMES.application,
  CAPABILITIES_COLUMN_NAMES.resource,
  CAPABILITIES_COLUMN_NAMES.view,
  CAPABILITIES_COLUMN_NAMES.edit,
  CAPABILITIES_COLUMN_NAMES.create,
  CAPABILITIES_COLUMN_NAMES.delete,
  CAPABILITIES_COLUMN_NAMES.manage,
  CAPABILITIES_COLUMN_NAMES.empty,
];

export const columnTranslations = defineMessage({
  'name': {
    id: 'ui-authorization-roles.columns.name',
    defaultMessage: 'Name',
    description: 'Name column label',
  },
  'description': {
    id: 'ui-authorization-roles.columns.description',
    defaultMessage: 'Description',
    description: 'Description column label',
  },
  'updatedDate': {
    id: 'ui-authorization-roles.columns.updatedDate',
    defaultMessage: 'Updated',
    description: 'Updated date column label',
  },
  'updatedBy': {
    id: 'ui-authorization-roles.columns.updatedBy',
    defaultMessage: 'Updated by',
    description: 'Updated by column label',
  },
  [CAPABILITIES_COLUMN_NAMES.application]: {
    id: 'ui-authorization-roles.columns.application',
    defaultMessage: 'Application',
    description: 'Application column label',
  },
  [CAPABILITIES_COLUMN_NAMES.resource]: {
    id: 'ui-authorization-roles.columns.resource',
    defaultMessage: 'Resource/Resource sets',
    description: 'Resource/Resource sets column label',
  },
  [CAPABILITIES_COLUMN_NAMES.view]: {
    id: 'ui-authorization-roles.columns.view',
    defaultMessage: 'View',
    description: 'View column label',
  },
  [CAPABILITIES_COLUMN_NAMES.edit]: {
    id: 'ui-authorization-roles.columns.edit',
    defaultMessage: 'Edit',
    description: 'Edit column label',
  },
  [CAPABILITIES_COLUMN_NAMES.create]: {
    id: 'ui-authorization-roles.columns.create',
    defaultMessage: 'Create',
    description: 'Create column label',
  },
  [CAPABILITIES_COLUMN_NAMES.delete]: {
    id: 'ui-authorization-roles.columns.delete',
    defaultMessage: 'Delete',
    description: 'Delete column label',
  },
  [CAPABILITIES_COLUMN_NAMES.manage]: {
    id: 'ui-authorization-roles.columns.manage',
    defaultMessage: 'Manage',
    description: 'Manage column label',
  },
  'policies': {
    id: 'ui-authorization-roles.columns.policies',
    defaultMessage: 'Policies',
    description: 'Policies column label',
  },
  'settings': {
    id: 'ui-authorization-roles.columns.settings',
    defaultMessage: 'Settings/Settings sets',
    description: 'Settings/Settings sets column label',
  },
  'procedure': {
    id: 'ui-authorization-roles.columns.procedure',
    defaultMessage: 'Procedure',
    description: 'Procedure column label',
  },
  [CAPABILITIES_COLUMN_NAMES.execute]: {
    id: 'ui-authorization-roles.columns.execute',
    defaultMessage: 'Execute',
    description: 'Execute column label',
  },
});

export const formTranslations = defineMessage({
  name: {
    id: 'ui-authorization-roles.form.labels.name',
    defaultMessage: 'Name',
    description: 'Name label in a form',
  },
  description: {
    id: 'ui-authorization-roles.form.labels.description',
    defaultMessage: 'Description',
    description: 'Description label in a form',
  },
  multiplePolicies: {
    id: 'ui-authorization-roles.form.labels.description',
    defaultMessage: 'Description',
    description: 'Description label in a form',
  },
});
