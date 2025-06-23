import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AdvancedDataTable, Column, Action, Stats, FilterField, renderStatus, renderCurrency, renderBoolean, createEditAction, createDeleteAction } from './AdvancedDataTable';
import { FormModal, FormField, createTextField, createNumberField, createSelectField, createTextareaField } from './FormModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'react-hot-toast';
import { Package, Edit, Trash2 } from 'lucide-react';

interface CrudPageTemplateProps<T> {
  // Data
  data: T[];
  loading?: boolean;
  
  // Configuration
  entityName: string; // e.g., 'product', 'category'
  entityNamePlural: string; // e.g., 'products', 'categories'
  
  // Table configuration
  columns: Column<T>[];
  filterFields?: FilterField[];
  stats?: Stats[];
  searchable?: boolean;
  filterable?: boolean;
  
  // Form configuration
  formFields: FormField[];
  
  // CRUD operations
  onAdd: (data: Record<string, any>) => Promise<void>;
  onEdit: (id: string | number, data: Record<string, any>) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  onRefresh?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onImport?: () => Promise<void>;
  
  // Customization
  title?: string;
  subtitle?: string;
  cardRenderer?: (item: T) => React.ReactNode;
  additionalActions?: Action<T>[];
  
  // ID field
  idField?: keyof T;
}

export function CrudPageTemplate<T extends Record<string, any>>({
  data,
  loading = false,
  entityName,
  entityNamePlural,
  columns,
  filterFields = [],
  stats = [],
  searchable = true,
  filterable = true,
  formFields,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onExport,
  onImport,
  title,
  subtitle,
  cardRenderer,
  additionalActions = [],
  idField = 'id' as keyof T
}: CrudPageTemplateProps<T>) {
  const { t } = useTranslation();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Enhanced stats with automatic calculations
  const enhancedStats = useMemo(() => {
    const baseStats = [
      {
        label: t('total', 'Total'),
        value: data.length,
        icon: Package,
        color: 'text-blue-600'
      },
      ...stats
    ];

    // Auto-calculate active/inactive if status field exists
    const hasStatusField = data.length > 0 && 'status' in data[0];
    if (hasStatusField) {
      const activeCount = data.filter(item => item.status === 'active').length;
      const inactiveCount = data.length - activeCount;
      
      baseStats.push({
        label: t('active_count', 'Active'),
        value: activeCount,
        color: 'text-green-600'
      });
      
      baseStats.push({
        label: t('inactive_count', 'Inactive'),
        value: inactiveCount,
        color: 'text-red-600'
      });
    }

    return baseStats;
  }, [data, stats, t]);

  // Table actions
  const tableActions: Action<T>[] = [
    createEditAction<T>((item) => handleEdit(item)),
    createDeleteAction<T>((item) => handleDeleteClick(item)),
    ...additionalActions
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (item: T) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await onEdit(editingItem[idField], formData);
        toast.success(t('updateSuccess', '{{item}} updated successfully', { item: t(entityName) }));
      } else {
        await onAdd(formData);
        toast.success(t('createSuccess', '{{item}} created successfully', { item: t(entityName) }));
      }
      setIsFormModalOpen(false);
      if (onRefresh) await onRefresh();
    } catch (error) {
      toast.error(t('error', 'An error occurred'));
      console.error('CRUD operation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    
    setSubmitting(true);
    try {
      await onDelete(deletingItem[idField]);
      toast.success(t('deleteSuccess', '{{item}} deleted successfully', { item: t(entityName) }));
      setIsDeleteDialogOpen(false);
      if (onRefresh) await onRefresh();
    } catch (error) {
      toast.error(t('error', 'An error occurred'));
      console.error('Delete error:', error);
    } finally {
      setSubmitting(false);
      setDeletingItem(null);
    }
  };

  const emptyState = {
    title: t(`no${entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1)}`, `No ${entityNamePlural} yet`),
    description: t('getStarted', 'Get started by adding your first {{item}}', { item: t(entityName) }),
    action: {
      label: t(`add${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`, `Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`),
      onClick: handleAdd
    }
  };

  return (
    <>
      <AdvancedDataTable
        data={data}
        columns={columns}
        actions={tableActions}
        loading={loading}
        searchable={searchable}
        filterable={filterable}
        filterFields={filterFields}
        stats={enhancedStats}
        title={title || t(entityNamePlural)}
        subtitle={subtitle || t(`manage${entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1)}`, `Manage your ${entityNamePlural}`)}
        onAdd={handleAdd}
        onRefresh={onRefresh}
        onExport={onExport}
        onImport={onImport}
        emptyState={emptyState}
        cardRenderer={cardRenderer}
        viewModes={['table', 'cards']}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={editingItem 
          ? t(`edit${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`, `Edit ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`)
          : t(`add${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`, `Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`)
        }
        fields={formFields}
        initialData={editingItem || {}}
        loading={submitting}
        submitLabel={editingItem ? t('update', 'Update') : t('create', 'Create')}
        cancelLabel={t('cancel', 'Cancel')}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(`delete${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`, `Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmation', 'Are you sure you want to delete this {{item}}?', { item: t(entityName) })}
              {deletingItem && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>{deletingItem.name || deletingItem.title || `${t(entityName)} #${deletingItem[idField]}`}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t('cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? t('loading', 'Loading...') : t('delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to create standard CRUD configurations
export interface CrudConfig<T> {
  entityName: string;
  entityNamePlural: string;
  columns: Column<T>[];
  formFields: FormField[];
  filterFields?: FilterField[];
  stats?: Stats[];
  idField?: keyof T;
}

export const createCrudConfig = <T,>(config: CrudConfig<T>) => config;

// Pre-built configurations for common entities
export const productCrudConfig = createCrudConfig({
  entityName: 'product',
  entityNamePlural: 'products',
  columns: [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'sku', header: 'SKU', sortable: true, filterable: true },
    { key: 'sellingPrice', header: 'Price', sortable: true, render: renderCurrency },
    { key: 'currentStock', header: 'Stock', sortable: true },
    { key: 'isActive', header: 'Status', render: (value) => renderBoolean(value) }
  ],
  formFields: [
    createTextField('name', 'Product Name', { required: true }),
    createTextField('sku', 'SKU'),
    createNumberField('sellingPrice', 'Price', { required: true, validation: { min: 0 } }),
    createNumberField('currentStock', 'Stock', { required: true, validation: { min: 0 } }),
    createSelectField('categoryId', 'Category', []),
    createSelectField('unitId', 'Unit', []),
    createTextareaField('description', 'Description')
  ],
  filterFields: [
    { key: 'isActive', label: 'Status', type: 'select', options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]}
  ]
});

export const categoryCrudConfig = createCrudConfig({
  entityName: 'category',
  entityNamePlural: 'categories',
  columns: [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status', render: renderStatus }
  ],
  formFields: [
    createTextField('name', 'Category Name', { required: true }),
    createTextareaField('description', 'Description'),
    createSelectField('status', 'Status', [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ], { defaultValue: 'active' })
  ],
  filterFields: [
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ]
});

export const unitCrudConfig = createCrudConfig({
  entityName: 'unit',
  entityNamePlural: 'units',
  columns: [
    { key: 'name', header: 'Name', sortable: true, filterable: true },
    { key: 'symbol', header: 'Symbol', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'status', header: 'Status', render: renderStatus }
  ],
  formFields: [
    createTextField('name', 'Unit Name', { required: true }),
    createTextField('symbol', 'Symbol', { required: true }),
    createSelectField('type', 'Type', [
      { value: 'piece', label: 'Piece' },
      { value: 'weight', label: 'Weight' },
      { value: 'volume', label: 'Volume' },
      { value: 'length', label: 'Length' }
    ], { defaultValue: 'piece' }),
    createSelectField('status', 'Status', [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ], { defaultValue: 'active' })
  ],
  filterFields: [
    { key: 'type', label: 'Type', type: 'select', options: [
      { value: 'piece', label: 'Piece' },
      { value: 'weight', label: 'Weight' },
      { value: 'volume', label: 'Volume' },
      { value: 'length', label: 'Length' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]}
  ]
}); 