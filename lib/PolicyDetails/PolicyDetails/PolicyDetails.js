import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  AccordionSet,
  Accordion,
  ExpandAllButton,
  AccordionStatus,
  Pane,
  KeyValue,
  NoValue
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';
import { useStripes } from '@folio/stripes/core';

import css from '../style.css';

const PolicyDetails = ({ policy, onClose }) => {
  const { connect } = useStripes();

  const ConnectedViewMetaData = connect(ViewMetaData);

  return (
    <Pane
      defaultWidth="fill"
      paneTitle={policy.name}
      onClose={onClose}
      dismissible
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
  policy: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PolicyDetails;
