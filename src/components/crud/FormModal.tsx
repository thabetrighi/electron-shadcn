import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date';
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  disabled?: boolean;
  description?: string;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  title: string;
  description?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

interface FormErrors {
  [key: string]: string;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  fields,
  initialData = {},
  loading = false,
  submitLabel,
  cancelLabel
}: FormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    const data: Record<string, any> = {};
    fields.forEach(field => {
      data[field.key] = initialData[field.key] ?? field.defaultValue ?? '';
    });
    setFormData(data);
    setErrors({});
  }, [fields, initialData, isOpen]);

  const validateField = (field: FormField, value: any): string | null => {
    // Required validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }

    if (!value && !field.required) return null;

    // Type-specific validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'number' && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
    }

    // Custom validation
    if (field.validation) {
      const { min, max, pattern, custom } = field.validation;

      if (min !== undefined && value < min) {
        return `${field.label} must be at least ${min}`;
      }

      if (max !== undefined && value > max) {
        return `${field.label} must be at most ${max}`;
      }

      if (pattern && !pattern.test(value)) {
        return `${field.label} format is invalid`;
      }

      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.key];
    const value = formData[field.key] ?? '';

    const fieldId = `field-${field.key}`;

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {field.type === 'textarea' ? (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled || isSubmitting}
            className={hasError ? 'border-red-500' : ''}
          />
        ) : field.type === 'select' ? (
          <Select
            value={String(value)}
            onValueChange={(newValue) => handleInputChange(field.key, newValue)}
            disabled={field.disabled || isSubmitting}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <input
              id={fieldId}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleInputChange(field.key, e.target.checked)}
              disabled={field.disabled || isSubmitting}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor={fieldId} className="text-sm">
              {field.description || field.label}
            </Label>
          </div>
        ) : (
          <Input
            id={fieldId}
            type={field.type}
            value={value}
            onChange={(e) => {
              const newValue = field.type === 'number' ? 
                (e.target.value === '' ? '' : Number(e.target.value)) : 
                e.target.value;
              handleInputChange(field.key, newValue);
            }}
            placeholder={field.placeholder}
            disabled={field.disabled || isSubmitting}
            className={hasError ? 'border-red-500' : ''}
            step={field.type === 'number' ? '0.01' : undefined}
          />
        )}

        {field.description && field.type !== 'checkbox' && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}

        {hasError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors[field.key]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelLabel || t('cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
              className="min-w-[100px]"
            >
              {(isSubmitting || loading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {submitLabel || t('save', 'Save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to create common field configurations
export const createTextField = (
  key: string, 
  label: string, 
  options?: Partial<FormField>
): FormField => ({
  key,
  label,
  type: 'text',
  ...options
});

export const createNumberField = (
  key: string, 
  label: string, 
  options?: Partial<FormField>
): FormField => ({
  key,
  label,
  type: 'number',
  ...options
});

export const createSelectField = (
  key: string, 
  label: string, 
  options: { value: string | number; label: string }[],
  fieldOptions?: Partial<FormField>
): FormField => ({
  key,
  label,
  type: 'select',
  options,
  ...fieldOptions
});

export const createTextareaField = (
  key: string, 
  label: string, 
  options?: Partial<FormField>
): FormField => ({
  key,
  label,
  type: 'textarea',
  ...options
});

export const createCheckboxField = (
  key: string, 
  label: string, 
  description?: string,
  options?: Partial<FormField>
): FormField => ({
  key,
  label,
  type: 'checkbox',
  description,
  ...options
}); 