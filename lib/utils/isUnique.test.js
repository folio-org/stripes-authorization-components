import { render } from '@folio/jest-config-stripes/testing-library/react';

import { isUniqueField } from './isUnique';

describe('isUniqueField', () => {
  test('should return fieldValue marked if it is unique', () => {
    const array = [{ id: 1, name: 'Foo' }, { id: 2, name: 'Boo' }];
    const fieldName = 'name';
    const fieldValue = 'Test';

    const { container } = render(isUniqueField(array, fieldName, fieldValue));
    expect(container.querySelector('mark')).toHaveTextContent('Test');
  });

  test('should return fieldValue as plain text if it is not unique', () => {
    const array = [{ id: 1, name: 'Foo' }, { id: 2, name: 'Boo' }];
    const fieldName = 'name';
    const fieldValue = 'Boo';

    const { container } = render(isUniqueField(array, fieldName, fieldValue));
    expect(container).toHaveTextContent('Boo');
    expect(container.querySelector('mark')).toBeNull();
  });

  test('should return fieldValue as plain text if array is empty', () => {
    const array = [];
    const fieldName = 'name';
    const fieldValue = 'Test';

    const { container } = render(isUniqueField(array, fieldName, fieldValue));
    expect(container).toHaveTextContent('Test');
    expect(container.querySelector('mark')).toBeNull();
  });
});
