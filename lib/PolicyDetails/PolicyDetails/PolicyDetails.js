import PropTypes from 'prop-types';
import {
  useCallback,
  useState,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';

import {
  Accordion,
  AccordionSet,
  AccordionStatus,
  Button,
  Col,
  ConfirmationModal,
  ExpandAllButton,
  Icon,
  KeyValue,
  NoValue,
  Pane,
  PaneHeader,
  Row,
} from '@folio/stripes/components';

import { ViewMetaData } from '@folio/stripes/smart-components';
import {
  IfInterface,
  useStripes,
} from '@folio/stripes/core';

import {
  isShared,
  isTenantConsortiumCentral,
} from '../../utils';

import css from '../style.css';

const PolicyDetails = ({
  policy,
  onClose,
  tenantId,
}) => {
  const stripes = useStripes();
  const intl = useIntl();

  const ConnectedViewMetaData = stripes.connect(ViewMetaData);

  const [isConfirmShareModalOpen, setConfirmShareModalOpen] = useState(false);

  const isPolicyShared = Boolean(stripes.hasInterface('consortia') && isShared(policy?.source));
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const isTargetTenantCentral = isTenantConsortiumCentral(stripes, targetTenantId);

  const renderActionMenu = useCallback(({ onToggle }) => {
    const isSharingPrevented = (
      !stripes.hasPerm('ui-consortia-settings.consortium-manager.share')
      || !isTargetTenantCentral
      || isPolicyShared
    );

    if (isSharingPrevented) return null;

    return (
      <>
        {!isSharingPrevented && (
          <Button
            buttonStyle="dropdownItem"
            onClick={() => {
              onToggle();
              setConfirmShareModalOpen(true);
            }}
          >
            <Icon icon="duplicate">
              <FormattedMessage id="stripes-authorization-components.shareToAll" />
            </Icon>
          </Button>
        )}
      </>
    );
  }, [isPolicyShared, isTargetTenantCentral, stripes]);

  const sharePolicy = () => {
    console.log('share policy');
    setConfirmShareModalOpen(false);
  };

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
            <Row>
              <Col xs>
                <KeyValue
                  data-testid="policy-name"
                  label={
                    <FormattedMessage id="stripes-authorization-components.policyDetails.columns.name" />
                  }
                  value={policy.name}
                />
              </Col>
              <Col xs>
                <IfInterface name="consortia">
                  <KeyValue
                    data-testid="role-shared"
                    label={<FormattedMessage id="stripes-authorization-components.details.centrallyManaged" />}
                    value={<FormattedMessage id={`stripes-authorization-components.filter.${isPolicyShared}`} />}
                  />
                </IfInterface>
              </Col>
            </Row>
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

      <ConfirmationModal
        open={isConfirmShareModalOpen}
        heading={intl.formatMessage({ id: 'ui-consortia-settings.consortiumManager.modal.confirmShare.all.heading' })}
        message={(
          <FormattedMessage
            id="ui-consortia-settings.consortiumManager.modal.confirmShare.all.message"
            values={{ term: policy?.name }}
          />
        )}
        onConfirm={sharePolicy}
        onCancel={() => setConfirmShareModalOpen(false)}
      />
    </Pane>
  );
};

PolicyDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  policy: PropTypes.object.isRequired,
  tenantId: PropTypes.string,
};

export default PolicyDetails;
