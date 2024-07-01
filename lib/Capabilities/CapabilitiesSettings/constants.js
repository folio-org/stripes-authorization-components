import { CAPABILITIES_COLUMN_NAMES } from '../constants';

export const visibleColumns = [
  CAPABILITIES_COLUMN_NAMES.application,
  CAPABILITIES_COLUMN_NAMES.resource,
  CAPABILITIES_COLUMN_NAMES.view,
  CAPABILITIES_COLUMN_NAMES.edit,
  CAPABILITIES_COLUMN_NAMES.manage,
  CAPABILITIES_COLUMN_NAMES.empty,
];

export const columnWidths = {
  [CAPABILITIES_COLUMN_NAMES.application]: '40%',
  [CAPABILITIES_COLUMN_NAMES.resource]: '36%',
  [CAPABILITIES_COLUMN_NAMES.view]: '6%',
  [CAPABILITIES_COLUMN_NAMES.edit]: '6%',
  [CAPABILITIES_COLUMN_NAMES.manage]: '6%',
};
