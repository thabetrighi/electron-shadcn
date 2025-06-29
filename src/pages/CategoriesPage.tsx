import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { FormField, createTextField, createSelectField, createTextareaField } from '../components/FormModal';
import { Column } from '../components/AdvancedDataTable';
import { Badge } from '../components/ui/badge';
import { Archive, Package, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/formatters';
import { renderStatus, renderDate } from '../utils/renderers';

interface Category {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  nameAr?: string;
  description?: string;
  parentId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  parent?: { name: string };
  productsCount?: number;
}

// Categories columns configuration
const categoriesColumns: Column<Record<string, any>>[] = [
  {
    key: 'name',
    header: 'Category Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '280px',
    render: (name: string, category: Record<string, any>) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Archive className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          {category.parent && (
            <div className="text-sm text-gray-500 flex items-center">
              <span className="text-gray-400 mr-1">Under:</span>
              <span className="font-medium">{category.parent.name}</span>
            </div>
          )}
        </div>
      </div>
    )
  },
  {
    key: 'nameEn',
    header: 'English Name',
    render: (nameEn: string) => (
      <span className="text-gray-700">{nameEn || '-'}</span>
    ),
    exportable: true
  },
  {
    key: 'nameFr',
    header: 'French Name',
    render: (nameFr: string) => (
      <span className="text-gray-700">{nameFr || '-'}</span>
    ),
    exportable: true
  },
  {
    key: 'nameAr',
    header: 'Arabic Name',
    render: (nameAr: string) => (
      <span className="text-gray-700 text-right">{nameAr || '-'}</span>
    ),
    exportable: true,
    align: 'right'
  },
  {
    key: 'productsCount',
    header: 'Products',
    render: (count: number) => (
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
          <Package className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-700">{count || 0}</span>
        </div>
      </div>
    ),
    sortable: true,
    type: 'number',
    exportable: true,
    align: 'center'
  },
  {
    key: 'status',
    header: 'Status',
    render: renderStatus,
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: renderDate,
    sortable: true,
    type: 'date',
    exportable: true
  }
];

export default function CategoriesPage() {
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Form fields with dynamic parent categories
  const formFields = useMemo((): FormField[] => {
    const parentCategories = categories.filter(c => c.status === 'active').map(c => ({
      value: c.id,
      label: c.name
    }));

    return [
      createTextField('name', t('categories.name', 'Category Name'), {
        validation: { required: true, minLength: 2, maxLength: 100 },
        placeholder: t('categories.namePlaceholder', 'Enter category name'),
        width: 'full'
      }),
      createTextField('nameEn', t('categories.englishName', 'English Name'), {
        placeholder: t('categories.englishNamePlaceholder', 'Enter English name'),
        width: 'half'
      }),
      createTextField('nameFr', t('categories.frenchName', 'French Name'), {
        placeholder: t('categories.frenchNamePlaceholder', 'Enter French name'),
        width: 'half'
      }),
      createTextField('nameAr', t('categories.arabicName', 'Arabic Name'), {
        placeholder: t('categories.arabicNamePlaceholder', 'Enter Arabic name'),
        width: 'half'
      }),
      createSelectField('parentId', t('categories.parent', 'Parent Category'), parentCategories, {
        placeholder: t('categories.selectParent', 'Select parent category (optional)'),
        searchable: true,
        clearable: true,
        width: 'half'
      }),
      createSelectField('status', t('categories.status', 'Status'), [
        { value: 'active', label: t('status.active', 'Active') },
        { value: 'inactive', label: t('status.inactive', 'Inactive') }
      ], {
        defaultValue: 'active',
        width: 'half'
      }),
      createTextareaField('description', t('categories.description', 'Description'), {
        rows: 3,
        placeholder: t('categories.descriptionPlaceholder', 'Enter category description (optional)'),
        width: 'full'
      })
    ];
  }, [categories, t]);

  // Enhanced statistics
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.status === 'active').length;
    const parentCategories = categories.filter(c => !c.parentId).length;
    const childCategories = categories.filter(c => c.parentId).length;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productsCount || 0), 0);

    return [
      {
        label: t('stats.totalCategories', 'Total Categories'),
        value: totalCategories,
        icon: Archive,
        color: 'text-orange-600',
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeCategories', 'Active Categories'),
        value: activeCategories,
        icon: Archive,
        color: 'text-green-600',
        format: 'number' as const,
        comparison: {
          value: totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 0,
          label: t('stats.ofTotal', 'of total')
        }
      },
      {
        label: t('stats.parentCategories', 'Parent Categories'),
        value: parentCategories,
        icon: Archive,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.childCategories', 'Sub Categories'),
        value: childCategories,
        icon: Archive,
        color: 'text-purple-600',
        format: 'number' as const
      },
      {
        label: t('stats.totalProducts', 'Total Products'),
        value: totalProducts,
        icon: Package,
        color: 'text-indigo-600',
        format: 'number' as const
      }
    ];
  }, [categories, t]);

  // CRUD operations
  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null
      };

      const response = await window.database.categories.create(categoryData);
      if (!response.success) throw new Error(response.error);
      
      setCategories(prev => [...prev, response.data]);
      toast.success(t('messages.categoryCreated', 'Category created successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(t('messages.createError', 'Failed to create category'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string | number, formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null
      };

      const response = await window.database.categories.update(Number(id), categoryData);
      if (!response.success) throw new Error(response.error);
      
      setCategories(prev => prev.map(c => c.id === id ? response.data : c));
      toast.success(t('messages.categoryUpdated', 'Category updated successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error(t('messages.updateError', 'Failed to update category'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      
      const response = await window.database.categories.delete(Number(id));
      if (!response.success) throw new Error(response.error);
      
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(t('messages.categoryDeleted', 'Category deleted successfully'));
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(t('messages.deleteError', 'Failed to delete category'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      
      await Promise.all(ids.map(id => window.database.categories.delete(Number(id))));
      setCategories(prev => prev.filter(c => !ids.includes(c.id)));
      toast.success(t('messages.categoriesDeleted', '{{count}} categories deleted successfully', { count: ids.length }));
    } catch (error) {
      console.error('Failed to delete categories:', error);
      toast.error(t('messages.bulkDeleteError', 'Failed to delete categories'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(undefined);
      
      const response = await window.database.categories.getAll();
      if (!response.success) throw new Error(response.error);
      
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError(t('messages.fetchError', 'Failed to load categories'));
      toast.error(t('messages.fetchError', 'Failed to load categories'));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Enhanced card renderer
  const cardRenderer = (category: Record<string, any>) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
            {category.parent && (
              <p className="text-sm text-gray-500">
                <span className="text-gray-400">Under:</span> {category.parent.name}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          {renderStatus(category.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {category.nameEn && (
          <div className="space-y-1">
            <span className="text-gray-500 text-sm font-medium">English Name:</span>
            <div className="font-medium text-gray-900">{category.nameEn}</div>
          </div>
        )}
        {category.nameFr && (
          <div className="space-y-1">
            <span className="text-gray-500 text-sm font-medium">French Name:</span>
            <div className="font-medium text-gray-900">{category.nameFr}</div>
          </div>
        )}
        {category.nameAr && (
          <div className="space-y-1">
            <span className="text-gray-500 text-sm font-medium">Arabic Name:</span>
            <div className="font-medium text-gray-900 text-right">{category.nameAr}</div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">Products:</span>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-700">{category.productsCount || 0}</span>
          </div>
        </div>
      </div>

      {category.description && (
        <div className="pt-2 border-t border-gray-100">
          <span className="text-gray-500 text-sm font-medium">Description:</span>
          <p className="mt-1 text-sm text-gray-700 line-clamp-2">{category.description}</p>
        </div>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      data={categories}
      loading={loading}
      error={error}
      entityName="category"
      entityNamePlural="categories"
      entityConfig={{
        icon: Archive,
        color: "text-orange-600",
        description: t("pages.categoriesSubtitle", "Organize products into categories"),
        category: "organization",
      }}
      columns={categoriesColumns}
      stats={stats}
      formFields={formFields}
      cardRenderer={cardRenderer}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      title={t("pages.categories", "Categories")}
      subtitle={t("pages.categoriesSubtitle", "Organize products into categories")}
    />
  );
}
