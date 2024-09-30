import noop from 'lodash/noop';
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
  IfPermission,
  useStripes,
} from '@folio/stripes/core';

import { MUTATION_ACTION_TYPE } from '../constants';
import {
  useDeleteRoleMutation,
  useInitialRoleSharing,
  useRoleById,
  useRoleMutationErrorHandler,
  useRoleSharing,
  useShowCallout,
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
  displayShareAction = false,
  isLoading = false,
  onDuplicate = noop,
  path,
  roleId,
  tenantId,
}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const ConnectedViewMetaData = stripes.connect(ViewMetaData);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isConfirmShareModalOpen, setIsConfirmShareModalOpen] = useState(false);

  const history = useHistory();
  const showCallout = useShowCallout();
  const { handleError } = useRoleMutationErrorHandler();

  const onClose = () => history.push(path);

  const { roleDetails: role } = useRoleById(roleId, { tenantId });
  const {
    mutateAsync: deleteRole,
    isLoading: isRoleDeleting,
  } = useDeleteRoleMutation(onClose, null, { tenantId });
  const {
    shareRole,
    isLoading: isRoleInitialSharing,
  } = useInitialRoleSharing(role);
  const {
    deleteSharedRole,
    isLoading: isSharedRoleDeleting,
  } = useRoleSharing();

  const isRoleShared = Boolean(stripes.hasInterface('consortia') && isShared(role));
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const isTargetTenantCentral = isTenantConsortiumCentral(stripes, targetTenantId);
  const isMutationsPrevented = isRoleShared && !isTargetTenantCentral;

  const handleDuplicate = () => {
    setIsDuplicating(false);
    onDuplicate();
  };

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
            <IfPermission perm="roles.item.post">
              <Button
                buttonStyle="dropdownItem"
                onClick={() => setIsDuplicating(true)}
              >
                <Icon size="small" icon="duplicate">
                  <FormattedMessage id="stripes-authorization-components.crud.duplicate" />
                </Icon>
              </Button>
            </IfPermission>
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

  const onRoleShare = useCallback(async () => {
    try {
      await shareRole();
      setIsConfirmShareModalOpen(false);
      showCallout({ messageId: 'stripes-authorization-components.role.share.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.share, error);
    }
  }, [handleError, shareRole, showCallout]);

  const onRoleDelete = useCallback(async () => {
    try {
      if (isRoleShared) {
        await deleteSharedRole({ role });
      } else {
        await deleteRole(roleId);
      }

      showCallout({ messageId: 'stripes-authorization-components.role.delete.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.delete, error);
    }
  }, [deleteRole, deleteSharedRole, handleError, isRoleShared, role, roleId, showCallout]);

  const paneTitle = isLoading || !role?.name ? <Loading /> : role?.name;

  return (
    <Pane
      defaultWidth="80%"
      renderHeader={renderProps => <PaneHeader
        {...renderProps}
        dismissible
        actionMenu={getActionMenu}
        paneTitle={paneTitle}
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
        heading={<FormattedMessage id="stripes-authorization-components.crud.deleteRole" />}
        message={(
          <FormattedMessage
            id="stripes-authorization-components.crud.deleteRoleConfirmation"
            values={{ rolename: role?.name }}
          />
        )}
        onConfirm={onRoleDelete}
        onCancel={() => setIsDeleting(false)}
        confirmLabel={<FormattedMessage id="stripes-authorization-components.crud.delete" />}
        isConfirmButtonDisabled={isRoleDeleting || isSharedRoleDeleting}
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
        isConfirmButtonDisabled={isRoleInitialSharing}
      />
      <ConfirmationModal
        open={isDuplicating}
        confirmLabel={<FormattedMessage id="stripes-authorization-components.crud.duplicate" />}
        heading={<FormattedMessage id="stripes-authorization-components.crud.duplicateRole" />}
        message={(
          <FormattedMessage
            id="stripes-authorization-components.crud.duplicateConfirmation"
            values={{ name: role?.name }}
          />
        )}
        onConfirm={handleDuplicate}
        onCancel={() => setIsDuplicating(false)}
      />
    </Pane>
  );
};

RoleDetails.propTypes = {
  displayShareAction: PropTypes.bool,
  isLoading: PropTypes.bool,
  onDuplicate: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  roleId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
