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

import {
  capabilitiesPropType,
  columnWidths,
  visibleColumns,
} from '../constants';
import { ItemActionCheckbox } from '../ItemActionCheckbox';
import {
  getColumnMapping,
  getResultsFormatter,
} from '../utils';

export const CapabilitiesDataType = ({
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
        isCapabilityDisabled={isCapabilityDisabled}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        item={item}
        isCapabilitySelected={isCapabilitySelected}
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
    <div data-testid="capabilities-data-type">
      <Headline size="large" margin="none" tag="h3">
        <FormattedMessage id="ui-authorization-roles.details.data" />
      </Headline>
      <MultiColumnList
        interactive={false}
        columnMapping={columnMapping}
        formatter={resultsFormatter}
        contentData={content}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
      />
    </div>
  );
};

CapabilitiesDataType.propTypes = {
  content: capabilitiesPropType,
  readOnly: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func,
};
