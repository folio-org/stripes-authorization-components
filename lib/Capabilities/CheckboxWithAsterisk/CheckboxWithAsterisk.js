import classNames from 'classnames';
import PropTypes from 'prop-types';

import { Checkbox } from '@folio/stripes/components';

import css from './index.css';

export const CheckboxWithAsterisk = ({ count, ...rest }) => {
  return (
    <div className={css['checkbox-wrapper']}>
      <Checkbox
        className={classNames({ [css['checkbox-with-asterisk']]: count && count > 1 })}
        {...rest}
      />
    </div>
  );
};

CheckboxWithAsterisk.propTypes = {
  count: PropTypes.number,
  readOnly: PropTypes.bool,
  checked: PropTypes.bool,
  id: PropTypes.string,
};
