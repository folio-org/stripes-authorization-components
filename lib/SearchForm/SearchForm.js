import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import { Button, SearchField } from '@folio/stripes/components';

import css from './style.css';

export const SearchForm = ({ searchTerm, setSearchTerm, onSubmit }) => {
  const intl = useIntl();

  return (
    <form
      className={css.lookupSearchContainer}
      onSubmit={onSubmit}
    >
      <SearchField
        autoFocus
        data-testid="search-field"
        ariaLabel={intl.formatMessage({ id: 'stripes-authorization-components.search' })}
        className={css.lookupSearch}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onClear={() => setSearchTerm('')}
      />
      <Button
        data-testid="search-button"
        type="submit"
      >
        <FormattedMessage id="stripes-authorization-components.search" />
      </Button>
    </form>
  );
};

SearchForm.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
