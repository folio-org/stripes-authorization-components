import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import {
  AccordionSet,
  Accordion,
  ExpandAllButton,
  AccordionStatus,
  Pane,
  Button,
  KeyValue,
  Icon,
  PaneHeader,
  Loading,
  NoValue,
  ConfirmationModal
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';
import {
  IfPermission,
  useStripes,
} from '@folio/stripes/core';

import {
  useDeleteRoleMutation,
  useErrorCallout,
  useRoleById,
} from '../hooks';
import { RoleDetailsCapabilitiesAccordion } from './RoleDetailsCapabilitiesAccordion';
import { RoleDetailsCapabilitySetsAccordion } from './RoleDetailsCapabilitySetsAccordion';
import { RoleDetailsUsersAccordion } from './RoleDetailsUsersAccordion';

import css from './style.css';

export const RoleDetails = ({
  isLoading = false,
  onDuplicate,
  path,
  roleId,
  tenantId,
}) => {
  const { connect } = useStripes();
  const ConnectedViewMetaData = connect(ViewMetaData);

  const history = useHistory();
  const { sendErrorCallout } = useErrorCallout();

  const onClose = () => history.push(path);

  const { roleDetails: role } = useRoleById(roleId, { tenantId });
  const { mutateAsync: deleteRole } = useDeleteRoleMutation(onClose, sendErrorCallout, { tenantId });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = () => {
    setIsDuplicating(false);
    onDuplicate();
  };

  const getActionMenu = () => (
    <>
      <IfPermission perm="roles.item.put">
        <Button
          buttonStyle="dropdownItem"
          onClick={() => history.push(`${path}/${roleId}/edit`)}
        >
          <Icon icon="edit">
            <FormattedMessage id="stripes-authorization-components.crud.edit" />
          </Icon>
        </Button>
      </IfPermission>
      <IfPermission perm="roles.item.delete">
        <Button
          buttonStyle="dropdownItem"
          onClick={() => setIsDeleting(true)}
        >
          <Icon icon="trash">
            <FormattedMessage id="stripes-authorization-components.crud.delete" />
          </Icon>
        </Button>
      </IfPermission>
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
    </>
  );

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
            <KeyValue
              data-testid="role-name"
              label={
                <FormattedMessage id="stripes-authorization-components.columns.name" />
              }
              value={role?.name}
            />
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
        onConfirm={() => deleteRole(roleId)}
        onCancel={() => setIsDeleting(false)}
        confirmLabel={<FormattedMessage id="stripes-authorization-components.crud.delete" />}
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
  isLoading: PropTypes.bool,
  onDuplicate: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  roleId: PropTypes.string.isRequired,
  tenantId: PropTypes.string,
};
