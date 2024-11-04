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
import {
  useHistory,
  useLocation,
} from 'react-router';

import {
  AccordionSet,
  AccordionStatus,
  Button,
  ConfirmationModal,
  ExpandAllButton,
  Icon,
  Loading,
  Pane,
  PaneHeader,
} from '@folio/stripes/components';
import {
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

import { RoleDetailsGeneralInfoAccordion } from './RoleDetailsGeneralInfoAccordion';
import css from './style.css';

export const RoleDetails = ({
  displayShareAction = false,
  isLoading: isLoadingProp = false,
  onDuplicate = noop,
  path,
  roleId,
  tenantId,
}) => {
  const stripes = useStripes();
  const intl = useIntl();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isConfirmShareModalOpen, setIsConfirmShareModalOpen] = useState(false);

  const { pathname } = useLocation();
  const history = useHistory();
  const showCallout = useShowCallout();
  const { handleError } = useRoleMutationErrorHandler();

  const onClose = useCallback(() => history.push(path), [history, path]);

  const {
    roleDetails: role,
    refetch,
    isLoading: isRoleLoading,
  } = useRoleById(roleId, { tenantId });
  const {
    mutateAsync: deleteRole,
    isLoading: isRoleDeleting,
  } = useDeleteRoleMutation(onClose, null, { tenantId });
  const {
    shareRole,
    isLoading: isRoleInitialSharing,
  } = useInitialRoleSharing(role, { tenantId });
  const {
    deleteSharedRole,
    isLoading: isSharedRoleDeleting,
  } = useRoleSharing();

  const isRoleShared = Boolean(stripes.hasInterface('consortia') && isShared(role));
  const targetTenantId = tenantId || stripes.okapi.tenant;
  const isTargetTenantCentral = isTenantConsortiumCentral(stripes, targetTenantId);
  const isMutationsPrevented = isRoleShared && (!isTargetTenantCentral || !pathname.startsWith('/consortia'));

  const handleDuplicate = () => {
    setIsDuplicating(false);
    onDuplicate();
  };

  const getActionMenu = ({ onToggle }) => {
    const isSharingPrevented = (
      !displayShareAction
      || !stripes.hasPerm('consortia.sharing-roles-all.item.post')
      || !isTargetTenantCentral
      || isRoleShared
    );
    const isActionMenuHidden = isMutationsPrevented && isSharingPrevented;

    if (isActionMenuHidden) return null;

    return (
      (
        <>
          {!isMutationsPrevented && (
            <IfPermission perm={isRoleShared ? 'consortia.sharing-roles-all.item.post' : 'roles.item.put'}>
              <Button buttonStyle="dropdownItem" onClick={() => history.push(`${path}/${roleId}/edit`)}>
                <Icon icon="edit">
                  <FormattedMessage id="stripes-authorization-components.crud.edit" />
                </Icon>
              </Button>
            </IfPermission>
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
            <IfPermission perm={isRoleShared ? 'consortia.sharing-roles-all.item.delete' : 'roles.item.delete'}>
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
            </IfPermission>
          )}
        </>
      )
    );
  };

  const onRoleShare = useCallback(async () => {
    try {
      await shareRole();
      refetch();
      setIsConfirmShareModalOpen(false);
      showCallout({ messageId: 'stripes-authorization-components.role.share.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.share, error);
    }
  }, [handleError, refetch, shareRole, showCallout]);

  const onRoleDelete = useCallback(async () => {
    try {
      if (isRoleShared) {
        await deleteSharedRole({ role });
        onClose();
      } else {
        await deleteRole(roleId);
      }

      showCallout({ messageId: 'stripes-authorization-components.role.delete.success' });
    } catch (error) {
      handleError(MUTATION_ACTION_TYPE.delete, error);
    }
  }, [deleteRole, deleteSharedRole, handleError, isRoleShared, onClose, role, roleId, showCallout]);

  const isLoading = isLoadingProp || isRoleLoading;
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
          <RoleDetailsGeneralInfoAccordion
            isLoading={isLoading}
            role={role}
            shared={isRoleShared}
          />
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
