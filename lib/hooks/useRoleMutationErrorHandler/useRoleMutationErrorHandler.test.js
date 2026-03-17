import {
  act,
  renderHook,
} from '@folio/jest-config-stripes/testing-library/react';

import { MUTATION_ACTION_TYPE } from '../../constants';
import { RoleMutationClientError } from '../../utils';
import { useErrorCallout } from '../useErrorCallout';
import { useRoleMutationErrorHandler } from './useRoleMutationErrorHandler';

jest.mock('../useErrorCallout', () => ({
  ...jest.requireActual('../useErrorCallout'),
  useErrorCallout: jest.fn(),
}));

const clientErrorMessage = 'Client error (e.g. role sharing validation)';
const clientError = new RoleMutationClientError(clientErrorMessage);
const serverErrorMessage = 'Server response error message';
const serverErrorResponse = {
  clone: () => structuredClone(serverErrorResponse),
  json: () => Promise.resolve({
    errors: [{
      code: 'testErrorCode',
      message: serverErrorMessage,
    }]
  }),
};

describe('useRoleMutationErrorHandler', () => {
  const sendErrorCallout = jest.fn();

  beforeEach(() => {
    useErrorCallout.mockReturnValue({ sendErrorCallout });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle role mutation client error', async () => {
    const { result } = renderHook(() => useRoleMutationErrorHandler());

    await act(async () => {
      await result.current.handleError(MUTATION_ACTION_TYPE.share, clientError);
    });

    expect(sendErrorCallout).toHaveBeenCalledWith(`stripes-authorization-components.role.share.error: ${clientErrorMessage}`);
  });

  it('should handle server response error', async () => {
    const { result } = renderHook(() => useRoleMutationErrorHandler());

    await act(async () => {
      await result.current.handleError(MUTATION_ACTION_TYPE.create, { response: serverErrorResponse });
    });

    expect(sendErrorCallout).toHaveBeenCalledWith(`stripes-authorization-components.role.create.error: ${serverErrorMessage}`);
  });
});
