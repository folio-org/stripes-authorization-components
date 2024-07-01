import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { MultiColumnList, Headline } from '@folio/stripes/components';

import { capabilitiesPropType } from './types';

import css from './styles.css';
import ItemActionCheckbox from './ItemActionCheckbox';
import { useColumnMapping, useResultsFormatter } from './helpers';

const CapabilitiesSettings = ({ content, readOnly, onChangeCapabilityCheckbox, onChangeCapabilitySetCheckBox, isCapabilitySelected, isCapabilityDisabled }) => {
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

  const renderItemActionCheckbox = (item, action) => {
    return <ItemActionCheckbox
      action={action}
      readOnly={readOnly}
      onChangeCapabilityCheckbox={onChangeCapabilityCheckbox}
      onChangeCapabilitySetCheckBox={onChangeCapabilitySetCheckBox}
      item={item}
      isCapabilitySelected={isCapabilitySelected}
      isCapabilityDisabled={isCapabilityDisabled}
    />;
  };

  return <div data-testid="capabilities-settings-type" className={css.gutterTop}>
    <Headline size="large" margin="none" tag="h3">
      <FormattedMessage id="ui-authorization-roles.details.settings" />
    </Headline>
    <MultiColumnList
      interactive={false}
      columnMapping={useColumnMapping()}
      formatter={useResultsFormatter(renderItemActionCheckbox)}
      contentData={content}
      visibleColumns={['application', 'resource', 'view', 'edit', 'manage', '']}
      columnWidths={{ application: '40%', resource: '36%', view: '6%', edit: '6%', manage: '6%' }}
    />
  </div>;
};

CapabilitiesSettings.propTypes = { content: capabilitiesPropType,
  readOnly: PropTypes.bool,
  onChangeCapabilityCheckbox: PropTypes.func,
  onChangeCapabilitySetCheckBox: PropTypes.func,
  isCapabilitySelected: PropTypes.func,
  isCapabilityDisabled: PropTypes.func };

export default CapabilitiesSettings;
