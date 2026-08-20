import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Accordion: jest.fn(({ children, displayWhenClosed, label }) => (
    <section>
      <h2>
        {label}
        {displayWhenClosed}
      </h2>
      {children}
    </section>
  )),
  AccordionSet: jest.fn(({ children }) => <div>{children}</div>),
  AccordionStatus: jest.fn(({ children }) => <div>{children}</div>),
  Button: jest.fn((props) => {
    const {
      children,
      disabled,
      onClick,
      type = 'button',
      ...buttonProps
    } = props;
    delete buttonProps.buttonStyle;
    delete buttonProps.icon;
    delete buttonProps.marginBottom0;

    const handleClick = onClick || (type === 'submit'
      ? (event) => {
        const { form, ownerDocument } = event.currentTarget;
        const SubmitEvent = ownerDocument.defaultView.Event;

        form?.dispatchEvent(new SubmitEvent('submit', {
          bubbles: true,
          cancelable: true,
        }));
      }
      : undefined);

    return (
      <button
        {...buttonProps}
        disabled={disabled}
        onClick={handleClick}
        type="button"
      >
        {children}
      </button>
    );
  }),
  collapseAllSections: jest.fn(),
  ConfirmationModal: jest.fn(({
    confirmLabel = 'confirm',
    heading,
    id,
    message,
    onConfirm,
    onCancel,
    onRemove,
    open,
  }) => (open === false ? null : (
    <div data-testid={id}>
      <span>ConfirmationModal</span>
      {heading}
      <div>{message}</div>
      <div>
        <button type="button" onClick={onConfirm}>confirm</button>
        {confirmLabel !== 'confirm' && (
          <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        )}
        <button type="button" onClick={onCancel}>cancel</button>
        <button type="button" onClick={onRemove}>remove</button>
      </div>
    </div>
  ))),
  expandAllSections: jest.fn(),
  ExpandAllButton: jest.fn(() => (
    <button type="button">stripes-components.collapseAll</button>
  )),
  formattedLanguageName: jest.fn((languageCode) => {
    switch (languageCode) {
      case 'en':
        return 'English';
      case 'es':
        return 'Spanish';
      case 'fr':
        return 'French';
      default:
        return '';
    }
  }),
  HasCommand: (props) => {
    const { commands, children } = props;
    const component =
      <>
        {commands.map((shortcut, index) => (
          <button key={index} type="button" onClick={() => shortcut.handler()}>{shortcut.name}</button>
        ))}{children};
      </>;
    return component;
  },
  Layer: jest.fn(({ children }) => <div data-testid="mock-layer">{children}</div>),
  Loading: () => <div>Loading</div>,
  LoadingPane: () => <div>LoadingPane</div>,
  LoadingView: jest.fn(() => <div>LoadingView</div>),
  Pane: jest.fn(({ children, footer, renderHeader }) => (
    <div>
      {renderHeader?.({})}
      {children}
      {footer}
    </div>
  )),
  PaneFooter: jest.fn(({ renderEnd, renderStart }) => (
    <footer>
      {renderStart}
      {renderEnd}
    </footer>
  )),
  PaneHeader: jest.fn(({
    actionMenu,
    onClose,
    paneTitle,
  }) => {
    const menu = actionMenu?.({ onToggle: jest.fn() });

    return (
      <header>
        <h1>{paneTitle}</h1>
        {onClose && (
          <button
            data-test-pane-header-dismiss-button
            type="button"
            onClick={onClose}
          >
            close
          </button>
        )}
        {menu && (
          <>
            <button type="button">stripes-components.paneMenuActionsToggleLabel</button>
            {menu}
          </>
        )}
      </header>
    );
  }),
  Paneset: jest.fn(({ children }) => <div>{children}</div>),
  TextArea: jest.fn(({
    input = {},
    label,
    onBlur,
    value,
    ...props
  }) => {
    delete props.meta;

    const id = props.id || props['data-testid'] || input.name;

    return (
      <>
        <label htmlFor={id}>{label}</label>
        <textarea
          {...props}
          {...input}
          defaultValue={value ?? input.value}
          id={id}
          onBlur={onBlur || input.onBlur}
        />
      </>
    );
  }),
  TextField: jest.fn(({
    error,
    input = {},
    label,
    onChange,
    required,
    value,
    ...props
  }) => {
    delete props.meta;

    const id = props.id || props['data-testid'] || input.name;

    return (
      <>
        <label htmlFor={id}>{label}</label>
        <input
          {...props}
          {...input}
          id={id}
          onChange={onChange || input.onChange}
          required={required}
          value={value ?? input.value}
        />
        {error && <div data-testid={`${id}-error`}>{error}</div>}
      </>
    );
  }),
}), { virtual: true });
