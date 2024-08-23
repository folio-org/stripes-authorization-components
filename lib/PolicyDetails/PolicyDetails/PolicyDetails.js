import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  AccordionSet,
  Accordion,
  ExpandAllButton,
  AccordionStatus,
  Pane,
  KeyValue,
  NoValue,
  PaneHeader
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';

import css from '../style.css';

const PolicyDetails = ({
  extendActionMenu,
  policy,
  onClose,
}) => {
  const { connect } = useStripes();

  const ConnectedViewMetaData = connect(ViewMetaData);

  const renderActionMenu = useCallback((actionMenuProps) => {
    return extendActionMenu?.(actionMenuProps);
  }, [extendActionMenu]);

  return (
    <Pane
      defaultWidth="fill"
      renderHeader={renderProps => <PaneHeader
        {...renderProps}
        dismissible
        actionMenu={renderActionMenu}
        paneTitle={policy.name}
        onClose={onClose}
      />}
    >
      <AccordionStatus>
        <div className={css.alignRightWrapper}>
          <ExpandAllButton />
        </div>
        <AccordionSet>
          <Accordion
            label={
              <FormattedMessage id="stripes-authorization-components.generalInformation" />
            }
          >
            <ConnectedViewMetaData
              id="policyMetadataId"
              contentId="policyMetadata"
              headingLevel={4}
              metadata={policy.metadata}
            />
            <KeyValue
              data-testid="policy-name"
              label={
                <FormattedMessage id="stripes-authorization-components.policyDetails.columns.name" />
              }
              value={policy.name}
            />
            <KeyValue
              data-testid="policy-description"
              label={
                <FormattedMessage id="stripes-authorization-components.policyDetails.columns.description" />
              }
              value={policy?.description ?? <NoValue />}
            />
          </Accordion>
        </AccordionSet>
      </AccordionStatus>
    </Pane>
  );
};

PolicyDetails.propTypes = {
  extendActionMenu: PropTypes.func,
  policy: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PolicyDetails;
