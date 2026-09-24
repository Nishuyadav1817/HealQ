import React from "react";
import { useState } from 'react';
import AuthField from './AuthField';
import { EyeIcon, EyeOffIcon, LockIcon } from './icons';

/**
 * A password AuthField with a show/hide toggle. Purely a client-side
 * display concern (input type swap) — no backend/auth-flow change.
 */
const PasswordField = ({ label = 'Password', ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      label={label}
      icon={LockIcon}
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-md p-1 text-ink-subtle transition-colors hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...rest}
    />
  );
};

export default PasswordField;
