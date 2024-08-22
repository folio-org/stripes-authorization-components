import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useChunkedCQLFetch } from '@folio/stripes/core';

import {
  APPLICATIONS_STEP_SIZE,
  CAPABILITIES_LIMIT,
} from '../../constants';
import { useChunkedApplicationCapabilities } from './useChunkedApplicationCapabilities';

jest.mock('@folio/stripes/core', () => ({
  useChunkedCQLFetch: jest.fn(),
}));

describe('useChunkedApplicationCapabilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useChunkedCQLFetch with correct parameters when appIds is not empty', () => {
    const mockAppIds = ['app1', 'app2'];

    useChunkedCQLFetch.mockReturnValue({
      items: [],
      isLoading: true,
    });

    const { result } = renderHook(() => useChunkedApplicationCapabilities(mockAppIds));

    expect(useChunkedCQLFetch).toHaveBeenCalledWith({
      endpoint: 'capabilities',
      ids: mockAppIds,
      limit: CAPABILITIES_LIMIT,
      idName: 'applicationId',
      queryOptions: {
        enabled: true,
      },
      reduceFunction: expect.any(Function),
      STEP_SIZE: APPLICATIONS_STEP_SIZE,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.queryKeys).toStrictEqual([]);
  });

  it('should call useChunkedCQLFetch with correct parameters when appIds is empty', () => {
    const mockAppIds = [];

    useChunkedCQLFetch.mockReturnValue({
      items: [],
      isLoading: false,
      queryKeys:[['key1', 'key2']]
    });

    const { result } = renderHook(() => useChunkedApplicationCapabilities(mockAppIds));

    expect(useChunkedCQLFetch).toHaveBeenCalledWith({
      endpoint: 'capabilities',
      ids: mockAppIds,
      limit: CAPABILITIES_LIMIT,
      idName: 'applicationId',
      queryOptions: {
        enabled: false,
      },
      reduceFunction: expect.any(Function),
      STEP_SIZE: APPLICATIONS_STEP_SIZE,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.queryKeys).toStrictEqual([['key1', 'key2']]);
  });

  it('should reduce data correctly using reduceFunction', () => {
    const mockAppIds = ['app1', 'app2'];

    const mockData = [
      { data: { capabilities: [{ id: 1 }, { id: 2 }] } },
      { data: { capabilities: [{ id: 3 }] } },
    ];

    useChunkedCQLFetch.mockImplementation(({ reduceFunction }) => {
      const items = reduceFunction(mockData);
      return { items, isLoading: false };
    });

    const { result } = renderHook(() => useChunkedApplicationCapabilities(mockAppIds));

    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(result.current.isLoading).toBe(false);
  });
});
