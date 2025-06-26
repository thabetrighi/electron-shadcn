import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { crudConfigurations } from '../components/enhanced-crud-configs';
import { toast } from 'react-hot-toast';

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

export default function CategoriesPage() {
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const config = crudConfigurations.categories;

  // Update form fields with parent category options
  const formFields = useMemo(() => {
    const parentCategories = categories.filter(c => c.status === 'active').map(c => ({
      value: c.id,
      label: c.name
    }));

    return config.formFields.map(field => {
      if (field.key === 'parentId') {
        return {
          ...field,
          options: parentCategories
        };
      }
      return field;
    });
  }, [categories, config.formFields]);

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
        icon: config.entityConfig.icon,
        color: config.entityConfig.color,
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeCategories', 'Active Categories'),
        value: activeCategories,
        icon: config.entityConfig.icon,
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
        icon: config.entityConfig.icon,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.childCategories', 'Sub Categories'),
        value: childCategories,
        icon: config.entityConfig.icon,
        color: 'text-purple-600',
        format: 'number' as const
      },
      {
        label: t('stats.totalProducts', 'Total Products'),
        value: totalProducts,
        icon: config.entityConfig.icon,
        color: 'text-orange-600',
        format: 'number' as const
      }
    ];
  }, [categories, t, config]);

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

  // Custom card renderer
  const cardRenderer = (category: Category) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm">
            {config.entityConfig.icon && React.createElement(config.entityConfig.icon, { className: 'w-5 h-5' })}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            {category.parent && (
              <p className="text-sm text-gray-500">Under: {category.parent.name}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {category.nameEn && (
          <div>
            <span className="text-gray-500">English Name:</span>
            <div className="font-medium">{category.nameEn}</div>
          </div>
        )}
        <div>
          <span className="text-gray-500">Products:</span>
          <div className="font-medium">{category.productsCount || 0}</div>
        </div>
      </div>
      
      {category.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      // Core data
      data={categories}
      loading={loading}
      error={error}
      
      // Entity configuration
      entityName="category"
      entityNamePlural="categories"
      entityConfig={config.entityConfig}
      
      // Table configuration
      columns={config.columns}
      filterFields={config.filterFields}
      stats={stats}
      
      // Display options
      searchable={true}
      filterable={true}
      sortable={true}
      paginated={true}
      selectable={true}
      exportable={true}
      
      // View modes
      viewModes={['table', 'cards']}
      defaultViewMode="table"
      cardRenderer={cardRenderer}
      
      // Form configuration
      formFields={formFields}
      formSections={[
        {
          title: t('sections.basicInfo', 'Basic Information'),
          fields: ['name', 'description']
        },
        {
          title: t('sections.multilingual', 'Multi-language Names'),
          fields: ['nameEn', 'nameFr', 'nameAr']
        },
        {
          title: t('sections.hierarchy', 'Category Hierarchy'),
          fields: ['parentId', 'status']
        }
      ]}
      
      // CRUD operations
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      
      // Customization
      title={t('categories.title', 'Categories')}
      subtitle={t('categories.subtitle', 'Organize products into categories')}
      
      // Advanced features
      enableAnalytics={true}
      idField="id"
      titleField="name"
      statusField="status"
      dateField="createdAt"
      
      // Configuration
      autoRefresh={true}
      refreshInterval={60000}
      preserveSelection={false}
      density="comfortable"
    />
  );
}
