import {
  columnTranslations,
  CAPABILITIES_COLUMN_NAMES,
} from './constants';

export const getResultsFormatter = (renderItemActionCheckbox) => ({
  [CAPABILITIES_COLUMN_NAMES.application]: (item) => item.applicationId,
  [CAPABILITIES_COLUMN_NAMES.resource]: (item) => item.resource,
  [CAPABILITIES_COLUMN_NAMES.view]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.view),
  [CAPABILITIES_COLUMN_NAMES.edit]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.edit),
  [CAPABILITIES_COLUMN_NAMES.create]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.create),
  [CAPABILITIES_COLUMN_NAMES.delete]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.delete),
  [CAPABILITIES_COLUMN_NAMES.manage]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.manage),
  [CAPABILITIES_COLUMN_NAMES.execute]: (item) => renderItemActionCheckbox(item, CAPABILITIES_COLUMN_NAMES.execute),
});

export const getColumnMapping = (formatMessage) => ({
  [CAPABILITIES_COLUMN_NAMES.application]: formatMessage(columnTranslations.application),
  [CAPABILITIES_COLUMN_NAMES.resource]: formatMessage(columnTranslations.resource),
  [CAPABILITIES_COLUMN_NAMES.view]: formatMessage(columnTranslations.view),
  [CAPABILITIES_COLUMN_NAMES.edit]: formatMessage(columnTranslations.edit),
  [CAPABILITIES_COLUMN_NAMES.create]: formatMessage(columnTranslations.create),
  [CAPABILITIES_COLUMN_NAMES.delete]: formatMessage(columnTranslations.delete),
  [CAPABILITIES_COLUMN_NAMES.manage]: formatMessage(columnTranslations.manage),
  [CAPABILITIES_COLUMN_NAMES.execute]: formatMessage(columnTranslations.execute),
});
