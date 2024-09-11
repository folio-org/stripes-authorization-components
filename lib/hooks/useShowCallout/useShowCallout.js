import { useContext, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { CalloutContext } from '@folio/stripes/core';

export const useShowCallout = () => {
  const callout = useContext(CalloutContext);

  return useCallback(
    ({ message, messageId, type = 'success', values = {}, ...rest }) => {
      if (callout) {
        callout.sendCallout({
          timeout: type === 'error' ? 0 : undefined,
          ...rest,
          message: message || <FormattedMessage id={messageId} values={values} />,
          type,
        });
      }
    },
    [callout],
  );
};
