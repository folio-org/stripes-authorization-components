import React, { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { MultiColumnList, Headline } from '@folio/stripes/components';

import { capabilitiesPropType } from './types';

import css from './styles.css';
import ItemActionCheckbox from './ItemActionCheckbox';
import { columnTranslations } from '../constants/translations';
import { getApplicationName } from '../utils/getApplicationName';
import {isUniqueField} from "../utils/isUnique";

const CapabilitiesSettings = ({ content, readOnly, onChangeCapabilityCheckbox, onChangeCapabilitySetCheckBox, isCapabilitySelected, isCapabilityDisabled, capabilitiesToCompare }) => {
  const { formatMessage } = useIntl();
  /**
   * Renders an action checkbox for an item.
   *
   * @param {Object} item - The capability item object.
   * @param {string} action - The action to render checkbox for action(e.g. 'view').
   * @return {JSX.Element} By requirements on non-readonly mode we should hide the checkboxes on
   * not related actions. Since every capability have only one action
   * (e.g. {...capability, action: 'view'}),
   * show only checkbox for that particular action.
   * If readOnly mode we should show the checkbox for all actions.
   */

  const renderItemActionCheckbox = useCallback((item, action) => {
    return <ItemActionCheckbox
      action={action}
      readOnly={readOnly}
      onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
      onChangeCapabilitySetCheckBox={onChangeCapabilitySetCheckBox}
      item={item}
      isCapabilitySelected={isCapabilitySelected}
      isCapabilityDisabled={isCapabilityDisabled}
    />;
  }, [isCapabilityDisabled, isCapabilitySelected, onChangeCapabilityCheckbox, onChangeCapabilitySetCheckBox, readOnly]);

  const columnMapping = useMemo(() => ({
    application: formatMessage(columnTranslations.application),
    resource: formatMessage(columnTranslations.resource),
    view: formatMessage(columnTranslations.view),
    edit: formatMessage(columnTranslations.edit),
    manage: formatMessage(columnTranslations.manage),
    // policies: formatMessage(columnTranslations.policies)
  }), [formatMessage]);

  const resultsFormatter = useMemo(() => ({
    application: item => isUniqueField(capabilitiesToCompare,'applicationId',getApplicationName(item.applicationId) ),
    resource: item => isUniqueField(capabilitiesToCompare, 'resource', item.resource),
    view: item => renderItemActionCheckbox(item, 'view'),
    edit: item => renderItemActionCheckbox(item, 'edit'),
    manage: item => renderItemActionCheckbox(item, 'manage'),
    // policies: (item) => <Badge>{item.policiesCount}</Badge>
  }), [renderItemActionCheckbox]);

  const visibleColumns = ['application', 'resource', 'view', 'edit', 'manage', ''];
  const columnWidth = { application: '40%', resource: '36%', view: '6%', edit: '6%', manage: '6%' };

  return <div data-testid="capabilities-settings-type" className={css.gutterTop}>
    <Headline size="large" margin="none" tag="h3">
      <FormattedMessage id="stripes-authorization-components.details.settings" />
    </Headline>
    <MultiColumnList
      interactive={false}
      columnMapping={columnMapping}
      formatter={resultsFormatter}
      contentData={content}
      visibleColumns={visibleColumns}
      columnWidths={columnWidth}
    />
  </div>;
};

CapabilitiesSettings.propTypes = {
  content: capabilitiesPropType,
  readOnly: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  onChangeCapabilitySetCheckBox: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func
};

export default CapabilitiesSettings;
