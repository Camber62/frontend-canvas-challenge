import { type ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ pending, variant = 'primary', disabled, children, className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`btn btn-${variant} ${className ?? ''}`}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? 'Подождите…' : children}
    </button>
  );
}
