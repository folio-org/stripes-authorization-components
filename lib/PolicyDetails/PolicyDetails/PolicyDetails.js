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

import { usePolicySharing } from '../../hooks';
import {
  isShared,
  isTenantConsortiumCentral,
} from '../../utils';

import css from '../style.css';

const PolicyDetails = ({
  policy,
  onClose,
  onEdit,
  tenantId,
  displayShareAction = false,
}) => {
  const stripes = useStripes();
  const intl = useIntl();

  const ConnectedViewMetaData = stripes.connect(ViewMetaData);

  const { upsertSharedPolicy } = usePolicySharing();

  const [isConfirmShareModalOpen, setIsConfirmShareModalOpen] = useState(false);

  const isPolicyShared = Boolean(stripes.hasInterface('consortia') && isShared(policy?.source));
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const isTargetTenantCentral = isTenantConsortiumCentral(stripes, targetTenantId);
  const isMutationsPrevented = isPolicyShared && !isTargetTenantCentral;

  const renderActionMenu = useCallback(({ onToggle }) => {
    const isSharingPrevented = (
      !displayShareAction
      || !stripes.hasPerm('consortia.sharing-settings.item.post')
      || !isTargetTenantCentral
      || isPolicyShared
    );
    const isActionMenuHidden = isMutationsPrevented && isSharingPrevented;

    if (isActionMenuHidden) return null;

    return (
      <>
        {!isMutationsPrevented && (
          <Button
            buttonStyle="dropdownItem"
            onClick={onEdit}
          >
            <Icon icon="edit">
              <FormattedMessage id="stripes-authorization-components.crud.edit" />
            </Icon>
          </Button>
        )}

        {!isSharingPrevented && (
          <Button
            buttonStyle="dropdownItem"
            onClick={() => {
              onToggle();
              setIsConfirmShareModalOpen(true);
            }}
          >
            <Icon icon="duplicate">
              <FormattedMessage id="stripes-authorization-components.shareToAll" />
            </Icon>
          </Button>
        )}
      </>
    );
  }, [displayShareAction, isMutationsPrevented, isPolicyShared, isTargetTenantCentral, onEdit, stripes]);

  const sharePolicy = useCallback(async () => {
    await upsertSharedPolicy({ policy })
      .then(() => setIsConfirmShareModalOpen(false));
  }, [policy, upsertSharedPolicy]);

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
        onCancel={() => setIsConfirmShareModalOpen(false)}
      />
    </Pane>
  );
};

PolicyDetails.propTypes = {
  displayShareAction: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  policy: PropTypes.object.isRequired,
  tenantId: PropTypes.string,
};

export default PolicyDetails;
