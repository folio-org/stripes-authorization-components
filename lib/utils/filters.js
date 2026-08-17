/**
 * Combines multiple predicate functions into a single predicate that returns
 * true only if every predicate returns true (logical AND). Falsy entries in
 * `filters` are ignored, so callers can conditionally include filters, e.g.
 * `composeFilters(byVisibility, searchTerm && byName(searchTerm))`.
 *
 * @param {...Function} filters - predicate functions of shape (item) => boolean
 * @returns {Function} combined predicate
 */
export const composeFilters = (...filters) => {
  const activeFilters = filters.filter(Boolean);

  return (item) => activeFilters.every((filterFn) => filterFn(item));
};

/**
 * Predicate matching capabilities/capability sets that aren't explicitly hidden.
 * A capability without a `visible` property is treated as visible.
 *
 * @param {Object} capability - a capability or capability set
 * @returns {boolean}
 */
export const isCapabilityVisible = (capability) => capability.visible !== false;
