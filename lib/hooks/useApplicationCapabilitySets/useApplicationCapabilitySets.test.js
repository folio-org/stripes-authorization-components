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
    const { result } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { cap1: true }
      }
    });

    expect(result.current.capabilitySets).toStrictEqual({ data: [], settings: [], procedural: [] });
    expect(result.current.roleCapabilitySetsListIds).toStrictEqual([]);
    expect(result.current.selectedCapabilitySetsMap).toStrictEqual({});
    expect(result.current.setSelectedCapabilitySetsMap).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.queryKeys).toStrictEqual([['key1', 'key2']]);
    expect(result.current.actionCapabilitySets).toStrictEqual({ data: {}, procedural: {}, settings: {} });
  });
  it('should set checkedAppIdsMap and call onSubmitSelectApplications', async () => {
    const items = [
      { id: 1, applicationId: 'cap1', type: 'data', action: 'edit', resource: 'r1' },
      { id: 12, applicationId: 'cap12', type: 'data', action: 'create', resource: 'r1' },
    ];
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items, isLoading: false });

    const { result } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { cap1: true }
      }
    });

    expect(result.current.capabilitySets).toStrictEqual({
      data: [
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
      procedural: [],
      settings: [],
    });
  });

  it('should set empty capabilities in the case of empty appIds', async () => {
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items: [], isLoading: false });
    const { result } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { cap1: true }
      }
    });

    await waitFor(async () => {
      expect(result.current.capabilitySets).toStrictEqual({ data: [], settings: [], procedural: [] });
      expect(result.current.selectedCapabilitySetsMap).toStrictEqual({});
    });
  });

  it('should remove unchecked capability sets from selectedCapabilitySetsMap', async () => {
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({
      items: [
        { id: 1, applicationId: 'app1', type: 'data', action: 'edit', resource: 'r1' },
      ],
      isLoading: false
    });

    const { result, rerender } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { app1: true }
      }
    });

    await waitFor(() => {
      result.current.setSelectedCapabilitySetsMap({ 333: true, 222: true });
    });

    rerender({ checkedAppIdsMap: { app2: true } });
    expect(result.current.selectedCapabilitySetsMap).toEqual({ 222: true, 333: true });

    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({
      items: [
        { id: 222, applicationId: 'app1', type: 'data', action: 'edit', resource: 'r1' },
      ],
      isLoading: false
    });

    rerender({ checkedAppIdsMap: { app2: true } });
    expect(result.current.selectedCapabilitySetsMap).toEqual({ 222: true });
  });

  it('should apply the provided filter function to the capability sets', () => {
    const items = [
      { id: 1, applicationId: 'cap1', type: 'data', action: 'edit', resource: 'r1' },
      { id: 12, applicationId: 'cap12', type: 'data', action: 'create', resource: 'r1' },
    ];
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items, isLoading: false });

    const filter = (capabilitySet) => capabilitySet.applicationId === 'cap1';

    const { result } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { cap1: true },
        filter,
      }
    });

    expect(result.current.capabilitySets).toStrictEqual({
      data: [
        {
          actions: {
            edit: 1,
          },
          applicationId: 'cap1',
          id: 1,
          resource: 'r1',
        },
      ],
      procedural: [],
      settings: [],
    });
    expect(result.current.capabilitySetsList).toStrictEqual([items[0]]);
    expect(result.current.actionCapabilitySets).toStrictEqual({
      data: { edit: [1] },
      procedural: {},
      settings: {},
    });
  });

  it('should retain checked state and keep selectedCapabilitySetsMap unfiltered when the visibility filter is toggled', async () => {
    // Test and initial data set with one visible, one hidden cap set. Visibility filter applied,
    const items = [
      { id: 'set-visible', applicationId: 'cap1', type: 'data', action: 'view', resource: 'r1', visible: true },
      { id: 'set-hidden', applicationId: 'cap1', type: 'data', action: 'view', resource: 'r2', visible: false },
    ];
    useChunkedApplicationCapabilitySets.mockClear().mockReturnValue({ items, isLoading: false });

    const showOnlyVisible = (capabilitySet) => capabilitySet.visible;
    const showAll = () => true;

    // setup: showOnlyVisible filter is active.
    const { result, rerender } = renderHook(useApplicationCapabilitySets, {
      initialProps: {
        checkedAppIdsMap: { cap1: true },
        filter: showOnlyVisible,
      }
    });

    // 1. Assert that the visibility works.
    expect(result.current.capabilitySetsList.map(({ id }) => id)).toEqual(['set-visible']);

    // 2. Add a hidden cap set to the state (selectedCapabilitySetsMap). Assert all are
    //    ouput, despite the visibility filter. State should be unaffected.
    await waitFor(() => {
      result.current.setSelectedCapabilitySetsMap({ 'set-visible': true, 'set-hidden': true });
    });

    expect(result.current.selectedCapabilitySetsMap).toEqual({ 'set-visible': true, 'set-hidden': true });

    // 3. Toggle "show hidden" on: the filter changes, hidden cap sets included in result.
    rerender({ checkedAppIdsMap: { cap1: true }, filter: showAll });
    expect(result.current.capabilitySetsList.map(({ id }) => id)).toEqual(['set-visible', 'set-hidden']);

    // 4. Toggle "show hidden" back off: the displayed list is filtered again, but state remains unfiltered.
    rerender({ checkedAppIdsMap: { cap1: true }, filter: showOnlyVisible });
    expect(result.current.capabilitySetsList.map(({ id }) => id)).toEqual(['set-visible']);
    expect(result.current.selectedCapabilitySetsMap).toEqual({ 'set-visible': true, 'set-hidden': true });
  });
});
