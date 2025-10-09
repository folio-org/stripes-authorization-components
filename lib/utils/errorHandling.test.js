import {
  getErrorsFromResponse,
  getErrorCodesFromResponse,
  getErrorMessagesFromResponse,
  reportCreateKeycloakUserErrors
} from './errorHandling';

describe('errorHandling', () => {
  describe('getErrorsFromResponse', () => {
    it('should return errors from response json', async () => {
      const response = {
        json: jest.fn().mockResolvedValue({ errors: [{ code: 'ERR1', message: 'Error 1' }] })
      };
      const result = await getErrorsFromResponse({ response });
      expect(result).toEqual([{ code: 'ERR1', message: 'Error 1' }]);
    });

    it('should return empty array if response json fails', async () => {
      const response = {
        json: jest.fn().mockRejectedValue(new Error('fail'))
      };
      const result = await getErrorsFromResponse({ response });
      expect(result).toEqual([]);
    });
  });

  describe('getErrorCodesFromResponse', () => {
    it('should return error codes from response', async () => {
      const response = {
        json: jest.fn().mockResolvedValue({ errors: [{ code: 'ERR1' }, { code: 'ERR2' }] })
      };
      const result = await getErrorCodesFromResponse({ response });
      expect(result).toEqual(['ERR1', 'ERR2']);
    });

    it('should filter out falsy codes', async () => {
      const response = {
        json: jest.fn().mockResolvedValue({ errors: [{ code: 'ERR1' }, { code: null }] })
      };
      const result = await getErrorCodesFromResponse({ response });
      expect(result).toEqual(['ERR1']);
    });
  });

  describe('getErrorMessagesFromResponse', () => {
    it('should return error messages from response', async () => {
      const response = {
        json: jest.fn().mockResolvedValue({ errors: [{ message: 'Error 1' }, { message: 'Error 2' }] })
      };
      const result = await getErrorMessagesFromResponse({ response });
      expect(result).toEqual(['Error 1', 'Error 2']);
    });

    it('should filter out falsy messages', async () => {
      const response = {
        json: jest.fn().mockResolvedValue({ errors: [{ message: 'Error 1' }, { message: '' }] })
      };
      const result = await getErrorMessagesFromResponse({ response });
      expect(result).toEqual(['Error 1']);
    });

    it('should return empty array on failure', async () => {
      const response = {
        json: jest.fn().mockRejectedValue(new Error('fail'))
      };
      const result = await getErrorMessagesFromResponse({ response });
      expect(result).toEqual([]);
    });
  });

  describe('reportCreateKeycloakUserErrors', () => {
    const intl = {
      formatMessage: jest.fn(({ id }, values) => `${id}: ${values.users} - ${values.error}`)
    };
    const sendErrorCallout = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should group errors and call sendErrorCallout for each error', () => {
      const recordsWithError = [
        { error: 'Error A', userId: 'user1' },
        { error: 'Error B', userId: 'user2' },
        { error: 'Error A', userId: 'user3' }
      ];
      reportCreateKeycloakUserErrors(recordsWithError, 'msgId', intl, sendErrorCallout);

      expect(intl.formatMessage).toHaveBeenCalledWith(
        { id: 'msgId' },
        { users: 'user1, user3', error: 'Error A' }
      );
      expect(intl.formatMessage).toHaveBeenCalledWith(
        { id: 'msgId' },
        { users: 'user2', error: 'Error B' }
      );
      expect(sendErrorCallout).toHaveBeenCalledTimes(2);
      expect(sendErrorCallout).toHaveBeenCalledWith('msgId: user1, user3 - Error A');
      expect(sendErrorCallout).toHaveBeenCalledWith('msgId: user2 - Error B');
    });

    it('should not call sendErrorCallout if recordsWithError is empty', () => {
      reportCreateKeycloakUserErrors([], 'msgId', intl, sendErrorCallout);
      expect(sendErrorCallout).not.toHaveBeenCalled();
    });
  });
});
