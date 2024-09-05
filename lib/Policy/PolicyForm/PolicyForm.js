import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Button,
  Layer,
  Pane,
  PaneFooter,
  PaneHeader,
  Paneset,
  Selection,
  TextArea,
  TextField
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import { validateRequired } from '../../utils';
import {
  FORM_FIELDS,
  POLICY_TYPES_OPTIONS,
  SOURCE_TYPES_OPTIONS,
} from '../constants';


const PolicyForm = ({
  handleSubmit,
  hasValidationErrors,
  isLoading = false,
  onClose,
  paneTitleId,
  pristine,
}) => {
  const paneFooterRenderStart = (
    <Button
      marginBottom0
      buttonStyle="default mega"
      onClick={onClose}
    >
      <FormattedMessage id="stripes-authorization-components.crud.cancel" />
    </Button>
  );

  const paneFooterRenderEnd = (
    <Button
      marginBottom0
      buttonStyle="primary mega"
      type="submit"
      disabled={hasValidationErrors || pristine || isLoading}
      onClick={handleSubmit}
    >
      <FormattedMessage id="stripes-components.saveAndClose" />
    </Button>
  );

  const intl = useIntl();

  return <form data-testid="create-policy-form">
    <Layer
      isOpen
      inRootSet
      contentLabel={intl.formatMessage({ id: paneTitleId })}
    >
      <Paneset isRoot>
        <Pane
          centerContent
          defaultWidth="100%"
          footer={(
            <PaneFooter
              renderStart={paneFooterRenderStart}
              renderEnd={paneFooterRenderEnd}
            />
          )}
          renderHeader={renderProps => (
            <PaneHeader
              {...renderProps}
              paneTitle={intl.formatMessage({ id: paneTitleId })}
              dismissible
              onClose={onClose}
            />
          )}
        >
          <Field
            component={TextField}
            required
            name={FORM_FIELDS.name}
            id={FORM_FIELDS.name}
            label={<FormattedMessage id="stripes-authorization-components.form.labels.name" />}
            data-testid="policy-name-input"
            validate={validateRequired}
          />
          <Field
            component={TextArea}
            name={FORM_FIELDS.description}
            id={FORM_FIELDS.description}
            label={<FormattedMessage id="stripes-authorization-components.form.labels.description" />}
            data-testid="policy-description-input"
          />
          <Field
            component={Selection}
            dataOptions={POLICY_TYPES_OPTIONS}
            name={FORM_FIELDS.type}
            id={FORM_FIELDS.type}
            required
            validate={validateRequired}
            label={<FormattedMessage id="stripes-authorization-components.form.labels.policyType" />}
            data-testid="policy-type-selection"
          />
          <Field
            component={Selection}
            dataOptions={SOURCE_TYPES_OPTIONS}
            name={FORM_FIELDS.source}
            id={FORM_FIELDS.source}
            required
            validate={validateRequired}
            label={<FormattedMessage id="stripes-authorization-components.form.labels.sourceType" />}
            data-testid="policy-source-type-selection"
          />
        </Pane>
      </Paneset>;
    </Layer>;
  </form>;
};

PolicyForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  hasValidationErrors: PropTypes.bool,
  isLoading: PropTypes.bool,
  onClose: PropTypes.func,
  paneTitleId: PropTypes.string,
  pristine: PropTypes.bool,
};

export default stripesFinalForm({
  navigationCheck: true,
  subscription: {
    hasValidationErrors: true,
    values: true,
  },
})(PolicyForm);
