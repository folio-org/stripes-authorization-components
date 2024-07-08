import { useIntl } from 'react-intl';

import { columnTranslations } from '../../constants';

export const useCheckboxAriaStates = () => {
  const { formatMessage } = useIntl();

  const getCheckboxAriaLabel = (action, resource) => `${formatMessage(columnTranslations[action])} ${resource}`;

  return { getCheckboxAriaLabel };
};
