import React from "react";
/**
 * Plain surface container reused for every card-like block across the
 * operational panels. `onClick` makes it behave like a selectable
 * option (hover/focus affordance included) without duplicating those
 * styles at every call site.
 */
const Card = ({ children, onClick, selected = false, className = '', as = 'div', ...rest }) => {
  const Tag = onClick ? 'button' : as;

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-lg border bg-surface-card p-4 text-left shadow-soft-sm transition-smooth duration-150 ${
        selected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-surface-border'
      } ${onClick ? 'w-full cursor-pointer hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-soft' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Card;
