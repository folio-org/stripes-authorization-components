import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';

import { MultiColumnList, Headline } from '@folio/stripes/components';
import { getApplicationName } from '../utils/getApplicationName';
import { capabilitiesPropType } from './types';
import { columnTranslations } from '../constants/translations';

import css from './styles.css';
import ItemActionCheckbox from './ItemActionCheckbox';
import {isUniqueField} from "../utils/isUnique";

const CapabilitiesProcedural = ({ content, readOnly, onChangeCapabilityCheckbox, isCapabilitySelected, isCapabilityDisabled, capabilitiesToCompare }) => {
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

  const columnMapping = useMemo(() => ({
    application: formatMessage(columnTranslations.application),
    resource: formatMessage(columnTranslations.settings),
    execute: formatMessage(columnTranslations.execute),
    // policies: formatMessage(columnTranslations.policies)
  }), [formatMessage]);

  const resultsFormatter = useMemo(() => ({
    application: item => isUniqueField(capabilitiesToCompare,'applicationId',getApplicationName(item.applicationId) ),
    resource: item => isUniqueField(capabilitiesToCompare, 'resource', item.resource),
    execute: item => renderItemActionCheckbox(item, 'execute'),
    // policies: (item) => <Badge>{item.policiesCount}</Badge>
  }), [renderItemActionCheckbox]);

  const visibleColumns = ['application', 'resource', 'execute', ''];
  const columnWidth = {
    application: '40%',
    resource: '48%',
    execute: '6%'
  };

  return (
    <div data-testid="capabilities-procedural-type" className={css.gutterTop}>
      <Headline size="large" margin="none" tag="h3">
        <FormattedMessage id="stripes-authorization-components.details.procedural" />
      </Headline>
      <MultiColumnList
        interactive={false}
        columnMapping={columnMapping}
        formatter={resultsFormatter}
        contentData={content}
        visibleColumns={visibleColumns}
        columnWidths={columnWidth}
      />
    </div>
  );
};

CapabilitiesProcedural.propTypes = { content: capabilitiesPropType,
  readOnly: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func };

export default CapabilitiesProcedural;
