import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
import { useStripes } from '@folio/stripes/core';

import { useDeleteRoleMutation, useErrorCallout, useRoleById } from '../hooks';
import { RoleDetailsUsersAccordion } from './RoleDetailsUsersAccordion';
import { RoleDetailsCapabilitiesAccordion } from './RoleDetailsCapabilitiesAccordion';
import { RoleDetailsCapabilitySetsAccordion } from './RoleDetailsCapabilitySetsAccordion';


import css from './style.css';

export const RoleDetails = ({ roleId, path }) => {
  const { connect } = useStripes();
  const intl = useIntl();
  const ConnectedViewMetaData = connect(ViewMetaData);

  const history = useHistory();
  const { sendErrorCallout } = useErrorCallout();

  const onClose = () => history.push(path);

  const { roleDetails: role } = useRoleById(roleId);
  const { mutateAsync: deleteRole } = useDeleteRoleMutation(onClose, sendErrorCallout);

  const [isDeleting, setIsDeleting] = useState(false);

  const getActionMenu = () => (
    <>
      <Button buttonStyle="dropdownItem" onClick={() => history.push(`${path}/${roleId}/edit`)}>
        <Icon icon="edit">
          <FormattedMessage id="stripes-authorization-components.crud.edit" />
        </Icon>
      </Button>
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
    </>
  );

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
          <RoleDetailsCapabilitySetsAccordion roleId={roleId} />
          <RoleDetailsCapabilitiesAccordion roleId={roleId} />
          <RoleDetailsUsersAccordion roleId={roleId} />
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
    </Pane>
  );
};

RoleDetails.propTypes = {
  roleId: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
};
