import { getUpdatedDisabledCapabilities } from './utils';

describe('getUpdatedDisabledCapabilities', () => {
  it('returns updated disabled capabilities on checked', () => {
    expect(getUpdatedDisabledCapabilities(['A', 'B', 'C'], { A:1, B:2, C:5, E:12 }, true))
      .toStrictEqual({ A:2, B:3, C:6, E:12 });
  });

  it('returns updated disabled capabilities on unchecked', () => {
    expect(getUpdatedDisabledCapabilities(['A', 'B', 'C'], { A:1, B:2, C:5, E:12 }, false))
      .toStrictEqual({ B:1, C:4, E:12 });
  });

  it('returns empty', () => {
    expect(getUpdatedDisabledCapabilities([], { A:1, B:2, C:5, E:12 }, false))
      .toStrictEqual({ A:1, B:2, C:5, E:12 });
  });
});
