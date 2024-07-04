import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Badge,
  Loading,
} from '@folio/stripes/components';

import { CapabilitiesSection } from '../../Capabilities';
import { useRoleCapabilitySets } from '../../hooks';

export const RoleDetailsCapabilitySetsAccordion = ({ roleId }) => {
  const {
    groupedRoleCapabilitySetsByType,
    capabilitySetsTotalCount,
    initialRoleCapabilitySetsSelectedMap,
    isSuccess
  } = useRoleCapabilitySets(roleId);

  if (!isSuccess) {
    return <Loading />;
  }

  const isCapabilitySetSelected = (capabilitySetId) => !!initialRoleCapabilitySetsSelectedMap[capabilitySetId];

  return (
    <Accordion
      closedByDefault
      label={<FormattedMessage id="stripes-authorization-components.details.capabilitySets" />}
      displayWhenClosed={
        <Badge>
          {capabilitySetsTotalCount}
        </Badge>
      }
    >
      <CapabilitiesSection
        readOnly
        isCapabilitySelected={isCapabilitySetSelected}
        capabilities={groupedRoleCapabilitySetsByType}
      />
    </Accordion>
  );
};

RoleDetailsCapabilitySetsAccordion.propTypes = {
  roleId: PropTypes.string.isRequired
};
