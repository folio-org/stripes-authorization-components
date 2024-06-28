import PropTypes from 'prop-types';
import {
  useCallback,
  useMemo,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  MultiColumnList,
  Headline,
} from '@folio/stripes/components';

import { capabilitiesPropType } from '../constants';
import { ItemActionCheckbox } from '../ItemActionCheckbox';
import {
  getColumnMapping,
  getResultsFormatter,
} from '../utils';
import {
  columnWidths,
  visibleColumns,
} from './constants';

import css from '../style.css';

export const CapabilitiesProcedural = ({
  content,
  readOnly,
  onChangeCapabilityCheckbox,
  isCapabilitySelected,
  isCapabilityDisabled,
}) => {
  const { formatMessage } = useIntl();

  const renderItemActionCheckbox = useCallback((item, action) => {
    return (
      <ItemActionCheckbox
        action={action}
        readOnly={readOnly}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        item={item}
        isCapabilitySelected={isCapabilitySelected}
        isCapabilityDisabled={isCapabilityDisabled}
      />
    );
  }, [readOnly, isCapabilityDisabled, onChangeCapabilityCheckbox, isCapabilitySelected]);

  const columnMapping = useMemo(() => {
    return getColumnMapping(formatMessage);
  }, [formatMessage]);

  const resultsFormatter = useMemo(() => {
    return getResultsFormatter(renderItemActionCheckbox);
  }, [renderItemActionCheckbox]);

  return (
    <div
      className={css.gutterTop}
      data-testid="capabilities-procedural-type"
    >
      <Headline size="large" margin="none" tag="h3">
        <FormattedMessage id="ui-authorization-roles.details.procedural" />
      </Headline>
      <MultiColumnList
        columnMapping={columnMapping}
        columnWidths={columnWidths}
        contentData={content}
        formatter={resultsFormatter}
        interactive={false}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

CapabilitiesProcedural.propTypes = {
  content: capabilitiesPropType,
  readOnly: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func,
};
