import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Accordion,
  Col,
  KeyValue,
  Loading,
  NoValue,
  Row,
} from '@folio/stripes/components';
import {
  IfInterface,
  useStripes,
} from '@folio/stripes/core';
import { ViewMetaData } from '@folio/stripes/smart-components';

export const RoleDetailsGeneralInfoAccordion = ({
  isLoading,
  role,
  shared,
}) => {
  const stripes = useStripes();

  const ConnectedViewMetaData = stripes.connect(ViewMetaData);

  const content = (
    <>
      <ConnectedViewMetaData metadata={role?.metadata} />
      <Row>
        <Col xs>
          <KeyValue
            data-testid="role-name"
            label={<FormattedMessage id="stripes-authorization-components.columns.name" />}
            value={role?.name}
          />
        </Col>
        <Col xs>
          <KeyValue
            label={<FormattedMessage id="stripes-authorization-components.columns.type" />}
            value={role?.type && (
              <FormattedMessage
                id={`stripes-authorization-components.role.type.${role.type.toLowerCase()}`}
                defaultMessage={role.type}
              />
            )}
          />
        </Col>
        <IfInterface name="consortia">
          <Col xs>
            <KeyValue
              data-testid="role-shared"
              label={<FormattedMessage id="stripes-authorization-components.details.centrallyManaged" />}
              value={<FormattedMessage id={`stripes-authorization-components.filter.${shared}`} />}
            />
          </Col>
        </IfInterface>
      </Row>
      <KeyValue
        data-testid="role-description"
        label={<FormattedMessage id="stripes-authorization-components.columns.description" />}
        value={role?.description ?? <NoValue />}
      />
    </>
  );

  return (
    <Accordion label={<FormattedMessage id="stripes-authorization-components.generalInformation" />}>
      {isLoading ? <Loading /> : content}
    </Accordion>
  );
};

RoleDetailsGeneralInfoAccordion.propTypes = {
  isLoading: PropTypes.bool,
  role: PropTypes.shape({
    description: PropTypes.string,
    metadata: PropTypes.object,
    name: PropTypes.string,
    type: PropTypes.string,
  }),
  shared: PropTypes.bool,
};
