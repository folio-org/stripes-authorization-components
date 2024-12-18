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

import { capabilitiesPropType, columnWidths, visibleColumns } from '../constants';
import { ItemActionCheckbox } from '../ItemActionCheckbox';
import {
  getColumnMapping,
  getResultsFormatter,
} from '../utils';

import css from '../style.css';

export const CapabilitiesSettings = ({
  content,
  readOnly,
  onChangeCapabilityCheckbox,
  onChangeCapabilitySetCheckBox,
  isCapabilitySelected,
  isCapabilityDisabled,
  capabilitiesToCompare = [],
  isNeedToCompare = false
}) => {
  const { formatMessage } = useIntl();

  const renderItemActionCheckbox = useCallback((item, action) => {
    return (
      <ItemActionCheckbox
        action={action}
        readOnly={readOnly}
        onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
        onChangeCapabilitySetCheckBox={onChangeCapabilitySetCheckBox}
        item={item}
        isCapabilitySelected={isCapabilitySelected}
        isCapabilityDisabled={isCapabilityDisabled}
      />
    );
  }, [
    readOnly,
    onChangeCapabilityCheckbox,
    onChangeCapabilitySetCheckBox,
    isCapabilitySelected,
    isCapabilityDisabled,
  ]);

  const columnMapping = useMemo(() => {
    return getColumnMapping(formatMessage);
  }, [formatMessage]);

  const resultsFormatter = useMemo(() => {
    return getResultsFormatter({
      renderItemActionCheckbox,
      capabilitiesToCompare,
      isNeedToCompare
    });
  }, [renderItemActionCheckbox, capabilitiesToCompare, isNeedToCompare]);

  return (
    <div
      className={css.gutterTop}
      data-testid="capabilities-settings-type"
    >
      <Headline
        tag="h3"
        size="large"
        margin="none"
      >
        <FormattedMessage id="stripes-authorization-components.details.settings" />
      </Headline>
      <MultiColumnList
        interactive={false}
        columnMapping={columnMapping}
        formatter={resultsFormatter}
        contentData={content}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
        maxHeight={500}
      />
    </div>
  );
};

CapabilitiesSettings.propTypes = {
  capabilitiesToCompare: capabilitiesPropType,
  content: capabilitiesPropType,
  isCapabilityDisabled: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isNeedToCompare: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  onChangeCapabilitySetCheckBox: PropTypes.func,
  readOnly: PropTypes.bool,
};
