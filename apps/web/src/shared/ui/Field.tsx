import { type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="field-control" data-invalid={error ? '' : undefined}>
        {children}
      </div>
      {error ? (
        <p id={`${id}-error`} className="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function TextInput({ id, label, error, ...rest }: InputProps) {
  return (
    <Field id={id} label={label} error={error}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Select({ id, label, error, children, ...rest }: SelectProps) {
  return (
    <Field id={id} label={label} error={error}>
      <select id={id} aria-invalid={Boolean(error)} {...rest}>
        {children}
      </select>
    </Field>
  );
}
