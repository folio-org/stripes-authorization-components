import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { waitFor } from '@folio/jest-config-stripes/testing-library/dom';

import { useChunkedApplicationCapabilitySets } from '../useChunkedApplicationCapabilitySets';
import { useApplicationCapabilitySets } from './useApplicationCapabilitySets';

jest.mock('../useChunkedApplicationCapabilitySets', () => ({
  useChunkedApplicationCapabilitySets: jest.fn(),
}));

jest.mock('@folio/stripes/core', () => ({
  ...jest.requireActual('@folio/stripes/core'),
  useStripes: jest.fn(() => ({
    config: { maxUnpagedResourceCount: 10 },
    discovery: {
      applications: {
        cap1: {},
        cap12: {}
      }
    },
  })),
  useChunkedCQLFetch: jest.fn().mockReturnValue({ isLoading: false, items: [] })
}));

describe('useApplicationCapabilitySets', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test if returning fields and methods are defined', () => {
    useChunkedApplicationCapabilitySets.mockReset().mockReturnValue({ items: [], isLoading: false, queryKeys: [['key1', 'key2']] });
    const { result } = renderHook(useApplicationCapabilitySets, { initialProps: {
      checkedAppIdsMap: { cap1: true }
    } });

    expect(result.current.capabilitySets).toStrictEqual({ data: [], settings: [], procedural: [] });
    expect(result.current.roleCapabilitySetsListIds).toStrictEqual([]);
    expect(result.current.selectedCapabilitySetsMap).toStrictEqual({});
    expect(result.current.setSelectedCapabilitySetsMap).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.queryKeys).toStrictEqual([['key1', 'key2']]);
  });
  it('should set checkedAppIdsMap and call onSubmitSelectApplications', async () => {
    const items = [
      { id: 1, applicationId: 'cap1', type: 'data', action:'edit', resource: 'r1' },
      { id: 12, applicationId: 'cap12', type: 'data', action: 'create', resource: 'r1' },
    ];
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items, isLoading: false });

    const { result } = renderHook(useApplicationCapabilitySets, { initialProps: {
      checkedAppIdsMap: { cap1: true }
    } });

    expect(result.current.capabilitySets).toStrictEqual({
      data:  [
        {
          actions: {
            edit: 1,
          },
          applicationId: 'cap1',
          id: 1,
          resource: 'r1',
        },
        {
          actions: {
            create: 12,
          },
          applicationId: 'cap12',
          id: 12,
          resource: 'r1',
        },
      ],
      procedural:  [],
      settings:  [],
    });
  });

  it('should set empty capabilities in the case of empty appIds', async () => {
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items: [], isLoading: false });
    const { result } = renderHook(useApplicationCapabilitySets, { initialProps: {
      checkedAppIdsMap: { cap1: true }
    } });

    await waitFor(async () => {
      expect(result.current.capabilitySets).toStrictEqual({ data: [], settings: [], procedural: [] });
      expect(result.current.selectedCapabilitySetsMap).toStrictEqual({});
    });
  });

  it('should remove unchecked capability sets from selectedCapabilitySetsMap', async () => {
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({
      items: [
        { id: 1, applicationId: 'app1', type: 'data', action:'edit', resource: 'r1' },
      ],
      isLoading: false
    });

    const { result, rerender } = renderHook(useApplicationCapabilitySets, { initialProps: {
      checkedAppIdsMap: { app1: true }
    } });

    await waitFor(() => {
      result.current.setSelectedCapabilitySetsMap({ 333: true, 222: true });
    });

    rerender({ checkedAppIdsMap:{ app2: true } });
    expect(result.current.selectedCapabilitySetsMap).toEqual({ 222:true, 333: true });

    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({
      items: [
        { id: 222, applicationId: 'app1', type: 'data', action:'edit', resource: 'r1' },
      ],
      isLoading: false
    });

    rerender({ checkedAppIdsMap:{ app2:true } });
    expect(result.current.selectedCapabilitySetsMap).toEqual({ 222:true });
  });
});
