import { composeFilters, isCapabilityVisible } from './filters';

describe('isCapabilityVisible', () => {
  it('returns true when visible is undefined', () => {
    expect(isCapabilityVisible({})).toBe(true);
  });

  it('returns true when visible is explicitly true', () => {
    expect(isCapabilityVisible({ visible: true })).toBe(true);
  });

  it('returns false when visible is explicitly false', () => {
    expect(isCapabilityVisible({ visible: false })).toBe(false);
  });
});

describe('composeFilters', () => {
  it('returns true for every item when called with no filters', () => {
    const combined = composeFilters();

    expect(combined({})).toBe(true);
    expect(combined({ visible: false })).toBe(true);
  });

  it('combines multiple predicates with logical AND', () => {
    const isEven = (item) => item.value % 2 === 0;
    const isPositive = (item) => item.value > 0;
    const combined = composeFilters(isEven, isPositive);

    expect(combined({ value: 4 })).toBe(true);
    expect(combined({ value: -4 })).toBe(false);
    expect(combined({ value: 3 })).toBe(false);
  });

  it('ignores falsy filters so callers can conditionally include them', () => {
    const isVisible = (item) => item.visible !== false;
    const combined = composeFilters(isVisible, false, undefined, null);

    expect(combined({ visible: true })).toBe(true);
    expect(combined({ visible: false })).toBe(false);
  });

  it('returns a predicate reflecting isCapabilityVisible when used as the only filter', () => {
    const combined = composeFilters(isCapabilityVisible);

    expect(combined({ visible: false })).toBe(false);
    expect(combined({ visible: true })).toBe(true);
    expect(combined({})).toBe(true);
  });
});
