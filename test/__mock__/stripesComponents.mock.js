import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Headline: jest.fn(({ children }) => <div>{ children }</div>),
}), { virtual: true });

jest.mock('@folio/stripes-components/util/currencies', () => {
  return {};
});
