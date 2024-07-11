import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Badge,
  Loading,
} from '@folio/stripes/components';

import { CapabilitiesSection } from '../../Capabilities';
import { useRoleCapabilities } from '../../hooks';

export const RoleDetailsCapabilitiesAccordion = ({ roleId }) => {
  const {
    capabilitiesTotalCount,
    initialRoleCapabilitiesSelectedMap,
    groupedRoleCapabilitiesByType,
    isSuccess
  } = useRoleCapabilities(roleId, null, true);

  if (!isSuccess) {
    return <Loading />;
  }

  const isCapabilitySelected = (capabilityId) => !!initialRoleCapabilitiesSelectedMap[capabilityId];

  return (
    <Accordion
      closedByDefault
      label={<FormattedMessage id="stripes-authorization-components.details.capabilities" />}
      displayWhenClosed={
        <Badge>
          {capabilitiesTotalCount}
        </Badge>
    }
    >
      <CapabilitiesSection
        readOnly
        isCapabilitySelected={isCapabilitySelected}
        capabilities={groupedRoleCapabilitiesByType}
      />
    </Accordion>
  );
};

RoleDetailsCapabilitiesAccordion.propTypes = {
  roleId: PropTypes.string.isRequired
};
