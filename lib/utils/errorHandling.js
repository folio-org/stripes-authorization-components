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
