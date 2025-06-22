import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tag, Plus, Search, Edit, Trash2, Folder } from 'lucide-react';

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

  const rootCategories = filteredCategories.filter(c => !c.parentId);
  const getSubcategories = (parentId: number) => 
    filteredCategories.filter(c => c.parentId === parentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadCategories} variant="outline" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {rootCategories.map((category) => {
          const subcategories = getSubcategories(category.id);
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-6 h-6 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>
                        {category.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                      {category.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {subcategories.length > 0 && (
                <CardContent>
                  <div className="pl-6 border-l-2 border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Subcategories ({subcategories.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subcategories.map((subcategory) => (
                        <div 
                          key={subcategory.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">{subcategory.name}</p>
                              <p className="text-xs text-gray-600">
                                {subcategory.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge 
                              variant={subcategory.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {subcategory.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteCategory(subcategory.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first category'
              }
            </p>
            {!searchTerm && (
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Root Categories</p>
                <p className="text-2xl font-bold text-green-600">
                  {categories.filter(c => !c.parentId).length}
                </p>
              </div>
              <Folder className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Categories</p>
                <p className="text-2xl font-bold text-blue-600">
                  {categories.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
