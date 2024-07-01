import { useIntl } from 'react-intl';
import { columnTranslations } from '../../constants/translations';
import { getApplicationName } from '../../utils/getApplicationName';

export const useCheckboxAriaStates = () => {
  const { formatMessage } = useIntl();

  const getCheckboxAriaLabel = (action, resource) => `${formatMessage(columnTranslations[action])} ${resource}`;

  return { getCheckboxAriaLabel };
};

export const useColumnMapping = () => {
  const { formatMessage } = useIntl();

  return {
    application: formatMessage(columnTranslations.application),
    resource:formatMessage(columnTranslations.resource),
    view: formatMessage(columnTranslations.view),
    edit: formatMessage(columnTranslations.edit),
    manage: formatMessage(columnTranslations.manage),
  // policies: formatMessage(columnTranslations.policies
  };
};

export const useResultsFormatter = (renderItemActionCheckbox) => {
  return {
    application: item => getApplicationName(item.applicationId),
    resource: item => item.resource,
    view: item => renderItemActionCheckbox(item, 'view'),
    edit: item => renderItemActionCheckbox(item, 'edit'),
    manage: item => renderItemActionCheckbox(item, 'manage'),
  // policies: (item) => <Badge>{item.policiesCount}</Badge>
  };
};
