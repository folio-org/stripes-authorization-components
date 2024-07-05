import React, { useCallback, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { MultiColumnList, Headline } from '@folio/stripes/components';

import { capabilitiesPropType } from './types';
import { columnTranslations } from '../constants/translations';
import ItemActionCheckbox from './ItemActionCheckbox';
import { isUniqueField } from '../utils/isUnique';

const CapabilitiesDataType = ({
  content,
  readOnly,
  onChangeCapabilityCheckbox,
  isCapabilitySelected,
  isCapabilityDisabled,
  capabilitiesToCompare = []
}) => {
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
    resource: formatMessage(columnTranslations.resource),
    view: formatMessage(columnTranslations.view),
    edit: formatMessage(columnTranslations.edit),
    create: formatMessage(columnTranslations.create),
    delete: formatMessage(columnTranslations.delete),
    manage: formatMessage(columnTranslations.manage),
    // policies: formatMessage(columnTranslations.policies)
  }), [formatMessage]);

  const resultsFormatter = useMemo(() => ({
    application: (item) => isUniqueField(capabilitiesToCompare, 'applicationId', item.applicationId),
    resource: (item) => isUniqueField(capabilitiesToCompare, 'resource', item.resource),
    view: (item) => renderItemActionCheckbox(item, 'view'),
    edit: (item) => renderItemActionCheckbox(item, 'edit'),
    create: (item) => renderItemActionCheckbox(item, 'create'),
    delete: (item) => renderItemActionCheckbox(item, 'delete'),
    manage: (item) => renderItemActionCheckbox(item, 'manage'),
    // policies: (item) => <Badge>{item.policiesCount}</Badge>
  }), [renderItemActionCheckbox, capabilitiesToCompare]);

  const visibleColumns = [
    'application',
    'resource',
    'view',
    'edit',
    'create',
    'delete',
    'manage',
    '',
  ];

  const columnWidths = {
    application: '40%',
    resource: '24%',
    view: '6%',
    edit: '6%',
    create: '6%',
    delete: '6%',
    manage: '6%',
  };

  return (
    <div data-testid="capabilities-data-type">
      <Headline size="large" margin="none" tag="h3">
        <FormattedMessage id="stripes-authorization-components.details.data" />
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
  capabilitiesToCompare: capabilitiesPropType,
};

export default CapabilitiesDataType;

