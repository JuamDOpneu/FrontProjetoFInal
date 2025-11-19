import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', disabled = false }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn-${variant}`} disabled={disabled}>
      {children}
    </button>
  );
}
export default Button;