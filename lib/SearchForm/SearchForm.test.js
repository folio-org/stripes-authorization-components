import { axe, toHaveNoViolations } from 'jest-axe';

import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import { SearchForm } from './SearchForm';

const setSearchTerm = jest.fn();
const onSubmit = jest.fn();

describe('SearchForm', () => {
  it('renders SearchField and Button components', () => {
    const { getByTestId } = render(
      <SearchForm searchTerm="" setSearchTerm={setSearchTerm} onSubmit={onSubmit} />
    );
    expect(getByTestId('search-field')).toBeInTheDocument();
    expect(getByTestId('search-button')).toBeInTheDocument();
  });

  it('calls setSearchTerm when the search field content changes', async () => {
    const { getByTestId } = render(
      <SearchForm
        searchTerm=""
        setSearchTerm={setSearchTerm}
        onSubmit={onSubmit}
      />
    );

    await userEvent.type(getByTestId('search-field'), 'New test search term');

    expect(setSearchTerm).toHaveBeenCalledWith('New test search term');
  });

  it('calls onSubmit handler', async () => {
    const { getByTestId } = render(
      <SearchForm
        searchTerm=""
        setSearchTerm={setSearchTerm}
        onSubmit={onSubmit}
      />
    );

    userEvent.type(getByTestId('search-field'),
      'New test search term');

    await userEvent.click(getByTestId('search-button'));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const { container } = render(<SearchForm searchTerm="" setSearchTerm={setSearchTerm} onSubmit={onSubmit} />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
