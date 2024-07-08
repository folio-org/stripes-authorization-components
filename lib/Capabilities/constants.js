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
    id: 'stripes-authorization-components.columns.name',
    defaultMessage: 'Name',
    description: 'Name column label',
  },
  'description': {
    id: 'stripes-authorization-components.columns.description',
    defaultMessage: 'Description',
    description: 'Description column label',
  },
  'updatedDate': {
    id: 'stripes-authorization-components.columns.updatedDate',
    defaultMessage: 'Updated',
    description: 'Updated date column label',
  },
  'updatedBy': {
    id: 'stripes-authorization-components.columns.updatedBy',
    defaultMessage: 'Updated by',
    description: 'Updated by column label',
  },
  [CAPABILITIES_COLUMN_NAMES.application]: {
    id: 'stripes-authorization-components.columns.application',
    defaultMessage: 'Application',
    description: 'Application column label',
  },
  [CAPABILITIES_COLUMN_NAMES.resource]: {
    id: 'stripes-authorization-components.columns.resource',
    defaultMessage: 'Resource/Resource sets',
    description: 'Resource/Resource sets column label',
  },
  [CAPABILITIES_COLUMN_NAMES.view]: {
    id: 'stripes-authorization-components.columns.view',
    defaultMessage: 'View',
    description: 'View column label',
  },
  [CAPABILITIES_COLUMN_NAMES.edit]: {
    id: 'stripes-authorization-components.columns.edit',
    defaultMessage: 'Edit',
    description: 'Edit column label',
  },
  [CAPABILITIES_COLUMN_NAMES.create]: {
    id: 'stripes-authorization-components.columns.create',
    defaultMessage: 'Create',
    description: 'Create column label',
  },
  [CAPABILITIES_COLUMN_NAMES.delete]: {
    id: 'stripes-authorization-components.columns.delete',
    defaultMessage: 'Delete',
    description: 'Delete column label',
  },
  [CAPABILITIES_COLUMN_NAMES.manage]: {
    id: 'stripes-authorization-components.columns.manage',
    defaultMessage: 'Manage',
    description: 'Manage column label',
  },
  'policies': {
    id: 'stripes-authorization-components.columns.policies',
    defaultMessage: 'Policies',
    description: 'Policies column label',
  },
  'settings': {
    id: 'stripes-authorization-components.columns.settings',
    defaultMessage: 'Settings/Settings sets',
    description: 'Settings/Settings sets column label',
  },
  'procedure': {
    id: 'stripes-authorization-components.columns.procedure',
    defaultMessage: 'Procedure',
    description: 'Procedure column label',
  },
  [CAPABILITIES_COLUMN_NAMES.execute]: {
    id: 'stripes-authorization-components.columns.execute',
    defaultMessage: 'Execute',
    description: 'Execute column label',
  },
});
