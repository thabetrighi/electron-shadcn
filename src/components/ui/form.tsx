import React from 'react';
import { useForm, UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../utils/tailwind';

// Form Context
const FormContext = React.createContext<UseFormReturn<any> | null>(null);

const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form');
  }
  return context;
};

// Form Root Component
interface FormProps<T extends FieldValues> {
  children: React.ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  className?: string;
}

export function Form<T extends FieldValues>({
  children,
  onSubmit,
  schema,
  defaultValues,
  className
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
  });

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form Field Component
interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  children: (field: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
  }) => React.ReactNode;
}

export function FormField<T extends FieldValues>({
  name,
  children
}: FormFieldProps<T>) {
  const form = useFormContext();
  const fieldState = form.getFieldState(name);
  const field = form.register(name);

  return (
    <>
      {children({
        value: form.watch(name),
        onChange: (value) => form.setValue(name, value),
        onBlur: field.onBlur,
        error: fieldState.error?.message,
      })}
    </>
  );
}

// Form Item Component
interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export function FormItem({ children, className }: FormItemProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  );
}

// Form Label Component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// Form Control Component
interface FormControlProps {
  children: React.ReactNode;
}

export function FormControl({ children }: FormControlProps) {
  return <div className="relative">{children}</div>;
}

// Form Message Component
interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

export function FormMessage({ children, className }: FormMessageProps) {
  if (!children) return null;

  return (
    <p className={cn('text-sm font-medium text-red-500', className)}>
      {children}
    </p>
  );
}

// Form Description Component
interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({ children, className }: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Form Submit Button
interface FormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function FormSubmit({ loading, children, className, ...props }: FormSubmitProps) {
  const form = useFormContext();
  
  return (
    <button
      type="submit"
      disabled={loading || form.formState.isSubmitting}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        className
      )}
      {...props}
    >
      {loading || form.formState.isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Export form hook for external use
export { useFormContext as useForm };

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL'),
  required: z.string().min(1, 'This field is required'),
  number: z.number().min(0, 'Must be a positive number'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
};
