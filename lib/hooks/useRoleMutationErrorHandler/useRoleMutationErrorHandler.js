import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { MUTATION_ACTION_TYPE } from '../../constants';
import { getErrorMessagesFromResponse } from '../../utils';
import { useErrorCallout } from '../useErrorCallout';

const errorMessageIdMap = new Map([
  [MUTATION_ACTION_TYPE.create, 'stripes-authorization-components.role.create.error'],
  [MUTATION_ACTION_TYPE.update, 'stripes-authorization-components.role.edit.error'],
  [MUTATION_ACTION_TYPE.delete, 'stripes-authorization-components.role.delete.error'],
  [MUTATION_ACTION_TYPE.share, 'stripes-authorization-components.role.share.error'],
]);

export const useRoleMutationErrorHandler = () => {
  const intl = useIntl();
  const { sendErrorCallout } = useErrorCallout();

  const handleError = useCallback(async (actionType, response) => {
    const errorMessages = response instanceof Error
      ? [response.message]
      : await getErrorMessagesFromResponse(response);

    const baseMessage = intl.formatMessage({
      id: errorMessageIdMap.get(actionType) || errorMessageIdMap.get(MUTATION_ACTION_TYPE.update),
    });

    if (errorMessages.length) {
      errorMessages.forEach((msg) => {
        const message = `${baseMessage}: ${msg}`;

        sendErrorCallout(message);
      });
    } else {
      sendErrorCallout(baseMessage);
    }
  }, [intl, sendErrorCallout]);

  return { handleError };
};
