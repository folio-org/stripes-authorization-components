import { CAPABILITIES_COLUMN_NAMES } from '../constants';

export const visibleColumns = [
  CAPABILITIES_COLUMN_NAMES.application,
  CAPABILITIES_COLUMN_NAMES.resource,
  CAPABILITIES_COLUMN_NAMES.execute,
  CAPABILITIES_COLUMN_NAMES.empty,
];

export const columnWidths = {
  [CAPABILITIES_COLUMN_NAMES.application]: '40%',
  [CAPABILITIES_COLUMN_NAMES.resource]: '48%',
  [CAPABILITIES_COLUMN_NAMES.execute]: '6%',
};
