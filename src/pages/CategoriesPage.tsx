import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { FormModal, createTextField, createTextareaField, createSelectField } from '../components/FormModal';
import { AdvancedDataTable, renderStatus, createEditAction, createDeleteAction, createBulkDeleteAction } from '../components/AdvancedDataTable';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Tag, Plus, Search, Edit, Trash2, Folder } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  description?: string;
  status: string;
  parentId?: number;
  sortOrder?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await window.database.categories.getAll();
      
      if (result.success) {
        setCategories(result.data || []);
      } else {
        setError(result.error || 'Failed to load categories');
      }
    } catch (err) {
      setError('Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteCategory = async (id: number) => {
    try {
      const result = await window.database.categories.delete(id);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        setError(result.error || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
      console.error('Error deleting category:', err);
    }
  };

  // Modal handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setSubmitting(true);
    try {
      const categoryData = {
        ...formData,
        status: formData.status || 'active',
      };

      if (editingCategory) {
        const result = await window.database.categories.update(editingCategory.id, categoryData);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success('Category updated successfully');
      } else {
        const result = await window.database.categories.create(categoryData);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success('Category created successfully');
      }
      
      setIsFormModalOpen(false);
      await loadCategories();
    } catch (error) {
      toast.error('An error occurred');
      console.error('CRUD operation error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    
    setSubmitting(true);
    try {
      const result = await window.database.categories.delete(deletingCategory.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
      await loadCategories();
    } catch (error) {
      toast.error('An error occurred');
      console.error('Delete error:', error);
    } finally {
      setSubmitting(false);
      setDeletingCategory(null);
    }
  };

  // Bulk actions handlers
  const handleBulkDelete = async (selectedCategories: Category[]) => {
    if (selectedCategories.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCategories.length} category/categories? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setSubmitting(true);
    try {
      const deletePromises = selectedCategories.map(category => 
        window.database.categories.delete(category.id)
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length === 0) {
        toast.success(`Successfully deleted ${selectedCategories.length} category/categories`);
      } else {
        toast.error(`Failed to delete ${failedDeletes.length} category/categories`);
      }
      
      await loadCategories();
    } catch (error) {
      toast.error('Error during bulk delete');
      console.error('Bulk delete error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkStatusToggle = async (selectedCategories: Category[]) => {
    if (selectedCategories.length === 0) return;
    
    setSubmitting(true);
    try {
      const updatePromises = selectedCategories.map(category => 
        window.database.categories.update(category.id, { 
          ...category,
          status: category.status === 'active' ? 'inactive' : 'active'
        })
      );
      
      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => !result.success);
      
      if (failedUpdates.length === 0) {
        toast.success(`Successfully updated ${selectedCategories.length} category/categories`);
      } else {
        toast.error(`Failed to update ${failedUpdates.length} category/categories`);
      }
      
      await loadCategories();
    } catch (error) {
      toast.error('Error during bulk update');
      console.error('Bulk update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const csvContent = categories.map(category => 
        `${category.name},${category.description || ''},${category.status}`
      ).join('\n');
      
      const blob = new Blob([`Name,Description,Status\n${csvContent}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'categories.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Categories exported successfully');
    } catch (error) {
      toast.error('Failed to export categories');
    }
  };

  // Form fields configuration
  const formFields = [
    createTextField('name', 'Category Name', { required: true }),
    createTextareaField('description', 'Description'),
    createSelectField('status', 'Status', [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ], { defaultValue: 'active' })
  ];

  // Table columns configuration
  const columns = [
    { 
      key: 'name' as keyof Category, 
      header: 'Name', 
      sortable: true, 
      filterable: true 
    },
    { 
      key: 'description' as keyof Category, 
      header: 'Description', 
      sortable: true, 
      filterable: true,
      render: (value: string) => value || <span className="text-gray-400">-</span>
    },
    { 
      key: 'status' as keyof Category, 
      header: 'Status', 
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  // Filter fields
  const filterFields = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ];

  // Stats
  const stats = [
    {
      label: 'Total Categories',
      value: categories.length,
      icon: Folder,
      color: 'text-blue-600'
    },
    {
      label: 'Active Categories',
      value: categories.filter(c => c.status === 'active').length,
      icon: Tag,
      color: 'text-green-600'
    },
    {
      label: 'Inactive Categories',
      value: categories.filter(c => c.status === 'inactive').length,
      icon: Tag,
      color: 'text-gray-600'
    }
  ];

  // Table actions
  const tableActions = [
    createEditAction<Category>(handleEditCategory),
    createDeleteAction<Category>(handleDeleteClick)
  ];

  // Bulk actions
  const bulkActions = [
    createBulkDeleteAction<Category>(handleBulkDelete),
    {
      label: 'Toggle Status',
      icon: Tag,
      onClick: handleBulkStatusToggle,
      variant: 'outline' as const
    }
  ];

  const emptyState = {
    title: 'No categories yet',
    description: 'Get started by adding your first category',
    action: {
      label: 'Add Your First Category',
      onClick: handleAddCategory
    }
  };

  // Custom card renderer
  const cardRenderer = (category: Category) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Folder className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                )}
              </div>
            </div>
            <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
              {category.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="flex space-x-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCategory(category)}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(category)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadCategories} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <AdvancedDataTable
        data={categories}
        columns={columns}
        actions={tableActions}
        bulkActions={bulkActions}
        loading={loading}
        searchable={true}
        filterable={true}
        filterFields={filterFields}
        stats={stats}
        title="Categories"
        subtitle="Organize your products into categories"
        onAdd={handleAddCategory}
        onRefresh={loadCategories}
        onExport={handleExport}
        emptyState={emptyState}
        cardRenderer={cardRenderer}
        viewModes={['table', 'cards']}
        selectable={true}
        pageSizes={[10, 25, 50, 100]}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        fields={formFields}
        initialData={editingCategory || {}}
        loading={submitting}
        submitLabel={editingCategory ? 'Update' : 'Create'}
        cancelLabel="Cancel"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              {deletingCategory && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <strong>{deletingCategory.name}</strong>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
