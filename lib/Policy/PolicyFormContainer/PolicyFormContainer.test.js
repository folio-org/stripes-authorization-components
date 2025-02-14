import { MemoryRouter, useHistory } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import stripesFinalForm from '@folio/stripes/final-form';

import {
  useAuthorizationPolicyById,
  useAuthorizationPolicyMutation,
  usePolicySharing,
  useShowCallout,
} from '../../hooks';
import { isShared } from '../../utils';
import {
  POLICY_TYPES,
  SOURCE_TYPES,
} from '../constants';
import { PolicyFormContainer } from './PolicyFormContainer';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  // useParams: jest.fn().mockReturnValue({ id: 1 }),
  useHistory: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Loading: jest.fn(() => 'Loading'),
  Layer: jest.fn(({ children }) => <div>{children}</div>)
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAuthorizationPolicyById: jest.fn().mockReturnValue({ policy: {}, isLoading: false }),
  useAuthorizationPolicyMutation: jest.fn(() => ({
    mutatePolicy: jest.fn().mockResolvedValue(),
    isLoading: false,
  })),
  usePolicySharing: jest.fn(),
  useShowCallout: jest.fn().mockReturnValue(jest.fn()),
}));
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  isShared: jest.fn(() => false),
}));

const renderForm = (props = {}) => (
  <form>
    <PolicyFormContainer
      path="/path"
      {...props}
    />
  </form>
);

const FormComponent = stripesFinalForm({})(renderForm);

const renderComponent = (props = {}) => render(
  <FormComponent onSubmit={() => { }} {...props} />,
  { wrapper: MemoryRouter },
);

const showCallout = jest.fn();
const upsertSharedPolicy = jest.fn(() => Promise.resolve());

describe('PolicyFormContainer', () => {
  beforeEach(() => {
    upsertSharedPolicy.mockClear();
    useShowCallout.mockReturnValue(showCallout);
    useAuthorizationPolicyById
      .mockClear()
      .mockReturnValue({
        policy: {
          source: SOURCE_TYPES.user,
          type: POLICY_TYPES.user,
        },
        isLoading: false
      });
    usePolicySharing
      .mockClear()
      .mockReturnValue({ upsertSharedPolicy });
  });

  it('should render Loading component when useAuthorizationPolicyById `isLoading` is true', async () => {
    useAuthorizationPolicyById
      .mockClear()
      .mockReturnValue({ policy: {}, isLoading: true });

    renderComponent();

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render component', () => {
    renderComponent();

    expect(screen.getByText('stripes-authorization-components.policy.create')).toBeInTheDocument();
  });

  it('should call mutatePolicy on submit', async () => {
    const mutatePolicy = jest.fn().mockResolvedValue({});
    useAuthorizationPolicyMutation.mockReturnValue({
      mutatePolicy,
      isLoading: false,
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/name/), 'name');
    await userEvent.type(screen.getByLabelText(/description/), 'description');
    await userEvent.click(screen.getByText('stripes-components.saveAndClose'));

    expect(mutatePolicy).toHaveBeenCalled();
    expect(showCallout).toHaveBeenCalledWith({
      messageId: 'stripes-authorization-components.policy.create.success'
    });
  });

  it('should call showCallout on error', async () => {
    const mutatePolicy = jest.fn().mockRejectedValue({});
    useAuthorizationPolicyMutation.mockReturnValue({
      mutatePolicy,
      isLoading: false,
    });

    renderComponent();

    await userEvent.type(screen.getByLabelText(/name/), 'name');
    await userEvent.type(screen.getByLabelText(/description/), 'description');
    await userEvent.click(screen.getByText('stripes-components.saveAndClose'));

    expect(showCallout).toHaveBeenCalledWith({
      messageId: 'stripes-authorization-components.policy.create.error',
      type: 'error',
    });
  });

  it('should call onClose on close', async () => {
    const push = jest.fn();
    useHistory.mockClear().mockReturnValue({ push });
    renderComponent();

    await userEvent.click(screen.getByText('stripes-authorization-components.crud.cancel'));

    expect(push).toHaveBeenCalledWith('/path');
  });

  describe('ECS mode', () => {
    it('should handle trigger policy sharing when a shared policy is updated', async () => {
      isShared.mockReturnValue(true);

      renderComponent();

      await userEvent.type(screen.getByLabelText(/name/), 'name');
      await userEvent.type(screen.getByLabelText(/description/), 'description');
      await userEvent.click(screen.getByText('stripes-components.saveAndClose'));

      expect(upsertSharedPolicy).toHaveBeenCalled();
      expect(showCallout).toHaveBeenCalledWith({
        messageId: 'stripes-authorization-components.policy.create.success'
      });
    });
  });

  it('has no a11y violations according to axe', async () => {
    expect.extend(toHaveNoViolations);

    const { container } = renderComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});

