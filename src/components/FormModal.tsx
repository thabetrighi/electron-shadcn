import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  AlertCircle, 
  Check, 
  X, 
  Upload, 
  Calendar, 
  Clock, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  Star,
  Info,
  Loader2,
  Image as ImageIcon,
  File,
  Link as LinkIcon,
  ChevronDown
} from 'lucide-react';

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, allValues: Record<string, any>) => string | null;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  number?: boolean;
  integer?: boolean;
  positive?: boolean;
  unique?: (value: any) => Promise<boolean>;
}

export interface FormFieldOption {
  value: string | number | boolean;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 
        'multiselect' | 'checkbox' | 'radio' | 'date' | 'datetime' | 'time' | 'file' | 
        'image' | 'color' | 'range' | 'json' | 'markdown' | 'rich-text' | 'tags' | 
        'currency' | 'percentage' | 'rating' | 'toggle' | 'country' | 'language';
  placeholder?: string;
  description?: string;
  tooltip?: string;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
  defaultValue?: any;
  disabled?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  accept?: string; // for file inputs
  rows?: number; // for textarea
  cols?: number;
  min?: number;
  max?: number;
  step?: number;
  width?: 'full' | 'half' | 'third' | 'quarter';
  conditional?: {
    field: string;
    value: any;
    operator?: 'equals' | 'not-equals' | 'contains' | 'greater' | 'less';
  };
  group?: string;
  order?: number;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  helpText?: string;
  errorMessage?: string;
  successMessage?: string;
  transform?: (value: any) => any;
  format?: (value: any) => string;
  parse?: (value: string) => any;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  title: string;
  subtitle?: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showProgress?: boolean;
  validateOnChange?: boolean;
  resetOnSubmit?: boolean;
  confirmClose?: boolean;
  sections?: { title: string; fields: string[]; collapsible?: boolean }[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  customActions?: React.ReactNode;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  onAutoSave?: (data: Record<string, any>) => void;
  debugMode?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  fields,
  initialData = {},
  loading = false,
  submitLabel,
  cancelLabel,
  size = 'md',
  showProgress = false,
  validateOnChange = true,
  resetOnSubmit = false,
  confirmClose = false,
  sections = [],
  layout = 'vertical',
  customActions,
  enableAutoSave = false,
  autoSaveInterval = 5000,
  onAutoSave,
  debugMode = false
}: FormModalProps) {
  const { t } = useTranslation();
  
  // Determine if this is edit mode
  const isEdit = initialData && Object.keys(initialData).length > 0 && initialData.id;
  
  // Form state
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  // Auto-save effect
  useEffect(() => {
    if (enableAutoSave && onAutoSave && isDirty) {
      const timer = setTimeout(() => {
        onAutoSave(formData);
      }, autoSaveInterval);
      return () => clearTimeout(timer);
    }
  }, [formData, enableAutoSave, onAutoSave, isDirty, autoSaveInterval]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultData = { ...initialData };
      fields.forEach(field => {
        if (defaultData[field.key] === undefined && field.defaultValue !== undefined) {
          defaultData[field.key] = field.defaultValue;
        }
      });
      setFormData(defaultData);
      setErrors({});
      setTouchedFields(new Set());
      setIsDirty(false);
    }
  }, [isOpen, initialData, fields]);

  // Validation function
  const validateField = useCallback(async (field: FormField, value: any, allValues: Record<string, any>) => {
    const validation = field.validation;
    if (!validation) return null;

    // Required validation
    if (validation.required) {
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        return t('validation.required', `${field.label} is required`);
      }
    }

    // Skip other validations if value is empty and not required
    if (!validation.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type-specific validations
    if (validation.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t('validation.email', 'Please enter a valid email address');
      }
    }

    if (validation.url && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        return t('validation.url', 'Please enter a valid URL');
      }
    }

    if (validation.phone && typeof value === 'string') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return t('validation.phone', 'Please enter a valid phone number');
      }
    }

    if (validation.number && typeof value === 'string') {
      if (isNaN(Number(value))) {
        return t('validation.number', 'Please enter a valid number');
      }
    }

    if (validation.integer && typeof value === 'string') {
      if (!Number.isInteger(Number(value))) {
        return t('validation.integer', 'Please enter a valid integer');
      }
    }

    if (validation.positive && Number(value) <= 0) {
      return t('validation.positive', 'Please enter a positive number');
    }

    // Length validations
    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      return t('validation.minLength', `Minimum length is ${validation.minLength} characters`);
    }

    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      return t('validation.maxLength', `Maximum length is ${validation.maxLength} characters`);
    }

    // Numeric range validations
    if (validation.min !== undefined && Number(value) < validation.min) {
      return t('validation.min', `Minimum value is ${validation.min}`);
    }

    if (validation.max !== undefined && Number(value) > validation.max) {
      return t('validation.max', `Maximum value is ${validation.max}`);
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
      return t('validation.pattern', 'Please enter a valid format');
    }

    // Unique validation
    if (validation.unique) {
      const isUnique = await validation.unique(value);
      if (!isUnique) {
        return t('validation.unique', 'This value must be unique');
      }
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(value, allValues);
      if (customError) return customError;
    }

    return null;
  }, [t]);

  // Validate all fields
  const validateForm = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    const validationPromises: Promise<void>[] = [];

    for (const field of fields) {
      if (field.hidden || field.disabled) continue;
      
      // Check conditional display
      if (field.conditional) {
        const conditionField = field.conditional.field;
        const conditionValue = formData[conditionField];
        const operator = field.conditional.operator || 'equals';
        
        let showField = false;
        switch (operator) {
          case 'equals':
            showField = conditionValue === field.conditional.value;
            break;
          case 'not-equals':
            showField = conditionValue !== field.conditional.value;
            break;
          case 'contains':
            showField = String(conditionValue).includes(String(field.conditional.value));
            break;
          case 'greater':
            showField = Number(conditionValue) > Number(field.conditional.value);
            break;
          case 'less':
            showField = Number(conditionValue) < Number(field.conditional.value);
            break;
        }
        
        if (!showField) continue;
      }

      validationPromises.push(
        validateField(field, formData[field.key], formData).then(error => {
          if (error) {
            newErrors[field.key] = error;
          }
        })
      );
    }

    await Promise.all(validationPromises);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField]);

  // Handle field change
  const handleFieldChange = useCallback(async (fieldKey: string, value: any) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;

    // Transform value if needed
    const transformedValue = field.transform ? field.transform(value) : value;
    
    setFormData(prev => ({ ...prev, [fieldKey]: transformedValue }));
    setTouchedFields(prev => new Set(prev).add(fieldKey));
    setIsDirty(true);

    // Validate on change if enabled
    if (validateOnChange) {
      const error = await validateField(field, transformedValue, { ...formData, [fieldKey]: transformedValue });
      setErrors(prev => ({
        ...prev,
        [fieldKey]: error || ''
      }));
      setValidationResults(prev => ({
        ...prev,
        [fieldKey]: !error
      }));
    }
  }, [fields, formData, validateField, validateOnChange]);

  // Handle form submit
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);
      
      if (resetOnSubmit) {
        setFormData({});
        setErrors({});
        setTouchedFields(new Set());
        setIsDirty(false);
      }
      
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, resetOnSubmit, onClose]);

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    if (confirmClose && isDirty) {
      if (window.confirm(t('form.confirmClose', 'You have unsaved changes. Are you sure you want to close?'))) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [confirmClose, isDirty, onClose, t]);

  // Filter visible fields based on conditions
  const getVisibleFields = useCallback(() => {
    return fields.filter(field => {
      if (field.hidden) return false;
      
      if (field.conditional) {
        const conditionField = field.conditional.field;
        const conditionValue = formData[conditionField];
        const operator = field.conditional.operator || 'equals';
        
        switch (operator) {
          case 'equals':
            return conditionValue === field.conditional.value;
          case 'not-equals':
            return conditionValue !== field.conditional.value;
          case 'contains':
            return String(conditionValue).includes(String(field.conditional.value));
          case 'greater':
            return Number(conditionValue) > Number(field.conditional.value);
          case 'less':
            return Number(conditionValue) < Number(field.conditional.value);
          default:
            return true;
        }
      }
      
      return true;
    });
  }, [fields, formData]);

  // Render field component
  const renderField = useCallback((field: FormField) => {
    const value = formData[field.key];
    const error = errors[field.key];
    const touched = touchedFields.has(field.key);
    const isValid = validationResults[field.key];

    const fieldProps = {
      id: field.key,
      name: field.key,
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      readOnly: field.readonly,
      value: value || '',
      onChange: (e: any) => {
        const newValue = e.target ? e.target.value : e;
        handleFieldChange(field.key, newValue);
      }
    };

    const showValidation = touched && (error || isValid);

    let fieldComponent: React.ReactNode;

    switch (field.type) {
      case 'textarea':
        fieldComponent = (
          <Textarea
            {...fieldProps}
            rows={field.rows || 3}
            className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
          />
        );
        break;

      case 'select':
        fieldComponent = (
          <Select 
            value={value !== null && value !== undefined ? String(value) : ''} 
            onValueChange={(newValue) => {
              // Try to convert back to number if the original value was a number
              const option = field.options?.find(opt => String(opt.value) === newValue);
              const convertedValue = option ? option.value : newValue;
              handleFieldChange(field.key, convertedValue);
            }}
            disabled={field.disabled || loading}
          >
            <SelectTrigger className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}>
              <SelectValue placeholder={field.placeholder || t('form.selectOption', 'Select an option')} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
                    <div className="flex items-center space-x-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
        break;

      case 'checkbox':
        fieldComponent = (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
              disabled={field.disabled || loading}
            />
            <Label htmlFor={field.key} className="text-sm">
              {field.label}
            </Label>
          </div>
        );
        break;

      case 'date':
        fieldComponent = (
          <Input
            {...fieldProps}
            type="date"
            className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
          />
        );
        break;

      case 'datetime':
        fieldComponent = (
          <Input
            {...fieldProps}
            type="datetime-local"
            className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
          />
        );
        break;

      case 'time':
        fieldComponent = (
          <Input
            {...fieldProps}
            type="time"
            className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
          />
        );
        break;

      case 'number':
      case 'currency':
      case 'percentage':
        fieldComponent = (
          <div className="relative">
            {field.prefix && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {field.prefix}
              </span>
            )}
            <Input
              {...fieldProps}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              className={`${field.prefix ? 'pl-8' : ''} ${field.suffix ? 'pr-8' : ''} ${
                error ? 'border-red-500' : isValid ? 'border-green-500' : ''
              }`}
            />
            {field.suffix && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                {field.suffix}
              </span>
            )}
          </div>
        );
        break;

      case 'password':
        const [showPassword, setShowPassword] = useState(false);
        fieldComponent = (
          <div className="relative">
            <Input
              {...fieldProps}
              type={showPassword ? 'text' : 'password'}
              className={`pr-10 ${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        );
        break;

      case 'file':
      case 'image':
        fieldComponent = (
          <div className="space-y-2">
            <Input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFieldChange(field.key, field.multiple ? files : files[0]);
              }}
              className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
            />
            {value && (
              <div className="text-sm text-gray-600">
                {Array.isArray(value) ? `${value.length} files selected` : value.name}
              </div>
            )}
          </div>
        );
        break;

      case 'tags':
        const tags = Array.isArray(value) ? value : [];
        fieldComponent = (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => {
                      const newTags = tags.filter((_, i) => i !== index);
                      handleFieldChange(field.key, newTags);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex">
              <Input
                placeholder={field.placeholder || t('form.enterTag', 'Enter a tag')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newTag = e.currentTarget.value.trim();
                    if (!tags.includes(newTag)) {
                      handleFieldChange(field.key, [...tags, newTag]);
                    }
                    e.currentTarget.value = '';
                  }
                }}
                className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
              />
            </div>
          </div>
        );
        break;

      default:
        fieldComponent = (
          <Input
            {...fieldProps}
            type={field.type}
            className={`${error ? 'border-red-500' : isValid ? 'border-green-500' : ''}`}
          />
        );
    }

    return (
      <div key={field.key} className={`space-y-2 ${getFieldWidth(field.width)}`}>
        {field.type !== 'checkbox' && (
          <div className="flex items-center space-x-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
              {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.tooltip && (
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            )}
          </div>
        )}
        
        {fieldComponent}
        
        {field.description && (
          <p className="text-sm text-gray-600">{field.description}</p>
        )}
        
        {field.helpText && !error && (
          <p className="text-sm text-blue-600 flex items-center">
            <Info className="w-4 h-4 mr-1" />
            {field.helpText}
          </p>
        )}
        
        {showValidation && (
          <div className="flex items-center space-x-1">
            {error ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </>
            ) : isValid ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">
                  {field.successMessage || t('form.valid', 'Valid')}
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>
    );
  }, [formData, errors, touchedFields, validationResults, loading, handleFieldChange, t]);

  const getFieldWidth = (width?: string) => {
    switch (width) {
      case 'half': return 'w-1/2';
      case 'third': return 'w-1/3';
      case 'quarter': return 'w-1/4';
      default: return 'w-full';
    }
  };

  const visibleFields = getVisibleFields();
  const hasErrors = Object.keys(errors).length > 0;
  const progress = visibleFields.length > 0 
    ? Math.round((Object.keys(validationResults).filter(key => validationResults[key]).length / visibleFields.length) * 100)
    : 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-${size === 'full' ? 'screen' : size} max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl`}>
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 ml-11">
            {subtitle || (isEdit ? 'Edit the form fields below and click save to update.' : 'Fill out the form fields below and click save to create.')}
          </DialogDescription>
          {showProgress && (
            <div className="mt-4 ml-11">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{t('form.progress', 'Progress')}</span>
                <span className="text-blue-600 font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.length > 0 ? (
            // Render sections
            sections.map((section, index) => {
              const sectionFields = section.fields
                .map(fieldKey => visibleFields.find(f => f.key === fieldKey))
                .filter(Boolean) as FormField[];
              
              if (sectionFields.length === 0) return null;
              
              const isCollapsed = collapsedSections.has(section.title);
              
              return (
                <Card key={index}>
                  <CardHeader 
                    className={`${section.collapsible ? 'cursor-pointer' : ''} pb-3`}
                    onClick={() => {
                      if (section.collapsible) {
                        setCollapsedSections(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(section.title)) {
                            newSet.delete(section.title);
                          } else {
                            newSet.add(section.title);
                          }
                          return newSet;
                        });
                      }
                    }}
                  >
                    <CardTitle className="text-lg flex items-center justify-between">
                      {section.title}
                      {section.collapsible && (
                        <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {!isCollapsed && (
                    <CardContent className="space-y-4">
                      <div className={`grid gap-4 ${layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {sectionFields.map(field => renderField(field))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          ) : (
            // Render fields without sections
            <div className={`grid gap-4 ${layout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {visibleFields.map(field => renderField(field))}
            </div>
          )}

          {debugMode && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify({ formData, errors, touched: Array.from(touchedFields) }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter className="flex justify-between items-center pt-6 border-t bg-gray-50/50 rounded-b-lg -m-6 mt-6 p-6">
          <div className="flex items-center space-x-3">
            {isDirty && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                {t('form.unsavedChanges', 'Unsaved changes')}
              </Badge>
            )}
            {enableAutoSave && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="w-3 h-3 mr-1" />
                {t('form.autoSave', 'Auto-save enabled')}
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                {Object.keys(errors).length} {t('form.errors', 'errors')}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-3">
            {customActions}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[80px] hover:bg-gray-50"
            >
              {cancelLabel || t('form.cancel', 'Cancel')}
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || loading}
              className="min-w-[100px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('form.submitting', 'Submitting...')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {submitLabel || t('form.submit', 'Submit')}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for creating form fields
export const createTextField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'text',
  ...options
});

export const createNumberField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'number',
  ...options
});

export const createSelectField = (
  key: string, 
  label: string, 
  options: FormFieldOption[], 
  fieldOptions: Partial<FormField> = {}
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
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'textarea',
  rows: 3,
  ...options
});

export const createCheckboxField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'checkbox',
  ...options
});

export const createDateField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'date',
  ...options
});

export const createEmailField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'email',
  validation: { email: true, ...options.validation },
  ...options
});

export const createPasswordField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'password',
  ...options
});

export const createCurrencyField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'currency',
  prefix: '$',
  validation: { number: true, positive: true, ...options.validation },
  ...options
});

export const createTagsField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'tags',
  defaultValue: [],
  ...options
});

export const createFileField = (
  key: string, 
  label: string, 
  accept?: string,
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'file',
  accept,
  ...options
});

export const createImageField = (
  key: string, 
  label: string, 
  options: Partial<FormField> = {}
): FormField => ({
  key,
  label,
  type: 'image',
  accept: 'image/*',
  ...options
}); 