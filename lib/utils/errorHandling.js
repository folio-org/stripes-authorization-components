import { ERROR_CODE_GENERIC } from '../constants';

export const getErrorsFromResponse = async ({ response }) => {
  try {
    const { errors } = await response.json();

    return errors;
  } catch {
    return [];
  }
};

export const getErrorCodesFromResponse = async (response) => {
  return getErrorsFromResponse(response)
    .then((errors) => (
      errors
        .map(({ code }) => code)
        .filter(Boolean)
    ))
    .catch(() => [ERROR_CODE_GENERIC]);
};

export const getErrorMessagesFromResponse = async (response) => {
  return getErrorsFromResponse(response)
    .then((errors) => (
      errors
        .map(({ message }) => message)
        .filter(Boolean)
    ))
    .catch(() => []);
};

export const reportCreateKeycloakUserErrors = (recordsWithError, messageId, intl, sendErrorCallout) => {
  const errorMessages = {};
  // Group same error messages together like { 'error message': [userId1, userId2], ... }
  for (const { error, userId } of recordsWithError) {
    errorMessages[error] ??= [];
    errorMessages[error].push(userId);
  }

  for (const [error, userIds] of Object.entries(errorMessages)) {
    const errorMessage = intl.formatMessage({
      id: messageId
    }, { users: userIds.join(', '), error });
    sendErrorCallout(errorMessage);
  }
};
