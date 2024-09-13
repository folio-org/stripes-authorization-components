import PropTypes from 'prop-types';
import {
  useCallback,
  useState,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { useHistory } from 'react-router';

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
  Loading,
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
  useDeleteRoleMutation,
  useErrorCallout,
  useInitialRoleSharing,
  useRoleById,
} from '../hooks';
import {
  isShared,
  isTenantConsortiumCentral,
} from '../utils';
import { RoleDetailsCapabilitiesAccordion } from './RoleDetailsCapabilitiesAccordion';
import { RoleDetailsCapabilitySetsAccordion } from './RoleDetailsCapabilitySetsAccordion';
import { RoleDetailsUsersAccordion } from './RoleDetailsUsersAccordion';

import css from './style.css';

export const RoleDetails = ({
  roleId,
  path,
  tenantId,
  displayShareAction = false,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const ConnectedViewMetaData = stripes.connect(ViewMetaData);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmShareModalOpen, setIsConfirmShareModalOpen] = useState(false);

  const history = useHistory();
  const { sendErrorCallout } = useErrorCallout();

  const onClose = () => history.push(path);

  const { roleDetails: role } = useRoleById(roleId, { tenantId });
  const { mutateAsync: deleteRole } = useDeleteRoleMutation(onClose, sendErrorCallout, { tenantId });
  const { shareRole } = useInitialRoleSharing(role);

  const isRoleShared = Boolean(stripes.hasInterface('consortia') && isShared(role?.source));
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const isTargetTenantCentral = isTenantConsortiumCentral(stripes, targetTenantId);
  const isMutationsPrevented = isRoleShared && !isTargetTenantCentral;

  const getActionMenu = ({ onToggle }) => {
    const isSharingPrevented = (
      !displayShareAction
      || !stripes.hasPerm('consortia.sharing-roles.item.post')
      || !isTargetTenantCentral
      || isRoleShared
    );
    const isActionMenuHidden = isMutationsPrevented && isSharingPrevented;

    if (isActionMenuHidden) return null;

    return (
      (
        <>
          {!isMutationsPrevented && (
            <Button buttonStyle="dropdownItem" onClick={() => history.push(`${path}/${roleId}/edit`)}>
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

          {!isMutationsPrevented && (
            <Button
              buttonStyle="dropdownItem"
              onClick={() => {
                setIsDeleting(true);
              }}
            >
              <Icon icon="trash">
                <FormattedMessage id="stripes-authorization-components.crud.delete" />
              </Icon>
            </Button>
          )}
        </>
      )
    );
  };

  const onRoleShare = useCallback(() => {
    return shareRole()
      .then(() => setIsConfirmShareModalOpen(false));
  }, [shareRole]);

  return (
    <Pane
      defaultWidth="80%"
      renderHeader={renderProps => <PaneHeader
        {...renderProps}
        dismissible
        actionMenu={getActionMenu}
        paneTitle={role?.name || <Loading />}
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
            <ConnectedViewMetaData metadata={role?.metadata} />

            <Row>
              <Col xs>
                <KeyValue
                  data-testid="role-name"
                  label={
                    <FormattedMessage id="stripes-authorization-components.columns.name" />
                  }
                  value={role?.name}
                />
              </Col>
              <IfInterface name="consortia">
                <Col xs>
                  <KeyValue
                    data-testid="role-shared"
                    label={<FormattedMessage id="stripes-authorization-components.details.centrallyManaged" />}
                    value={<FormattedMessage id={`stripes-authorization-components.filter.${isRoleShared}`} />}
                  /></Col>
              </IfInterface>
            </Row>
            <KeyValue
              data-testid="role-description"
              label={
                <FormattedMessage id="stripes-authorization-components.columns.description" />
              }
              value={role?.description ?? <NoValue />}
            />
          </Accordion>
          <RoleDetailsCapabilitySetsAccordion
            tenantId={tenantId}
            roleId={roleId}
          />
          <RoleDetailsCapabilitiesAccordion
            tenantId={tenantId}
            roleId={roleId}
          />
          <RoleDetailsUsersAccordion
            tenantId={tenantId}
            roleId={roleId}
          />
        </AccordionSet>
      </AccordionStatus>

      <ConfirmationModal
        open={isDeleting}
        heading={intl.formatMessage({ id: 'stripes-authorization-components.crud.deleteRole' })}
        message={<FormattedMessage
          id="stripes-authorization-components.crud.deleteRoleConfirmation"
          values={{ rolename: role?.name }}
        />}
        onConfirm={() => deleteRole(roleId)}
        onCancel={() => { setIsDeleting(false); }}
        confirmLabel={<FormattedMessage id="stripes-authorization-components.crud.delete" />}
      />

      <ConfirmationModal
        open={isConfirmShareModalOpen}
        heading={intl.formatMessage({ id: 'ui-consortia-settings.consortiumManager.modal.confirmShare.all.heading' })}
        message={(
          <FormattedMessage
            id="ui-consortia-settings.consortiumManager.modal.confirmShare.all.message"
            values={{ term: role?.name }}
          />
        )}
        onConfirm={onRoleShare}
        onCancel={() => setIsConfirmShareModalOpen(false)}
      />
    </Pane>
  );
};

RoleDetails.propTypes = {
  displayShareAction: PropTypes.bool,
  roleId: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
