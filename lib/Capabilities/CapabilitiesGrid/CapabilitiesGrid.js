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
  Checkbox,
  Headline,
  MultiColumnList,
} from '@folio/stripes/components';

import {
  capabilitiesPropType,
  columnWidths,
  visibleColumns,
} from '../constants';
import { ItemActionCheckbox } from '../ItemActionCheckbox';
import {
  getColumnMapping,
  getColumnMappingWithWrapper,
  getResultsFormatter,
} from '../utils';

export const CapabilitiesGrid = ({
  content,
  readOnly,
  onChangeCapabilityCheckbox,
  isCapabilitySelected,
  isCapabilityDisabled,
  capabilitiesToCompare = [],
  isNeedToCompare = false,
  type,
  toggleCapabilitiesHeaderCheckbox,
  isAllActionCapabilitiesSelected
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

  const renderHeaderActionCheckbox = (action) => {
    return <div key={action}>{formatMessage({ id:`stripes-authorization-components.columns.${action}` })} <Checkbox
      checked={isAllActionCapabilitiesSelected(action, type)}
      onChange={(event) => {
        toggleCapabilitiesHeaderCheckbox(event, type, action);
      }}
      aria-label={formatMessage({ id:'stripes-authorization-components.columns.header.checkbox' }, { action })}
    /></div>;
  };

  const columnMapping = readOnly ? getColumnMapping(formatMessage) : getColumnMappingWithWrapper(formatMessage, renderHeaderActionCheckbox);

  const resultsFormatter = useMemo(() => {
    return getResultsFormatter({
      renderItemActionCheckbox,
      capabilitiesToCompare,
      isNeedToCompare
    });
  }, [capabilitiesToCompare, isNeedToCompare, renderItemActionCheckbox]);

  return (
    <div data-testid={`capabilities-${type}-type`}>
      <Headline size="large" margin="none" tag="h3">
        <FormattedMessage id={`stripes-authorization-components.details.${type}`} />
      </Headline>
      <MultiColumnList
        interactive={false}
        columnMapping={columnMapping}
        formatter={resultsFormatter}
        contentData={content}
        visibleColumns={visibleColumns[type]}
        columnWidths={columnWidths[type]}
        maxHeight={500}
      />
    </div>
  );
};

CapabilitiesGrid.propTypes = {
  capabilitiesToCompare: capabilitiesPropType,
  content: capabilitiesPropType,
  isCapabilityDisabled: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isNeedToCompare: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  readOnly: PropTypes.bool,
  type: PropTypes.string,
  toggleCapabilitiesHeaderCheckbox: PropTypes.func,
  isAllActionCapabilitiesSelected: PropTypes.func,
};
