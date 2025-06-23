import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  MoreHorizontal, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  Columns,
  Grid,
  List,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronDown,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string;
  selectable?: boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

export interface Action<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline';
  condition?: (row: T) => boolean;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedRows: T[]) => void;
  variant?: 'default' | 'destructive' | 'outline';
  condition?: (selectedRows: T[]) => boolean;
}

export interface Stats {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

interface AdvancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  searchable?: boolean;
  filterable?: boolean;
  filterFields?: FilterField[];
  paginated?: boolean;
  pageSizes?: number[];
  loading?: boolean;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  title?: string;
  subtitle?: string;
  stats?: Stats[];
  viewModes?: ('table' | 'cards')[];
  cardRenderer?: (item: T) => React.ReactNode;
  emptyState?: {
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  idField?: keyof T;
  selectable?: boolean;
}

type ViewMode = 'table' | 'cards';

export function AdvancedDataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  actions = [],
  bulkActions = [],
  searchable = true,
  filterable = true,
  filterFields = [],
  paginated = true,
  pageSizes = [10, 25, 50, 100],
  loading = false,
  onAdd,
  onRefresh,
  onExport,
  onImport,
  title,
  subtitle,
  stats = [],
  viewModes = ['table', 'cards'],
  cardRenderer,
  emptyState,
  idField = 'id' as keyof T,
  selectable = true
}: AdvancedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Search filter
      if (searchTerm) {
        const searchMatch = Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!searchMatch) return false;
      }

      // Column filters
      for (const [key, value] of Object.entries(filters)) {
        if (value && value !== 'all' && String(row[key]) !== value) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);
  const paginatedData = paginated ? sortedData.slice(startIndex, endIndex) : sortedData;

  const handleSort = (key: keyof T) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (key: keyof T) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = columns.filter(col => col.visible !== false);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(row => row[idField]));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const getSelectedRowsData = () => {
    return data.filter(row => selectedRows.has(row[idField]));
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'all').length + (searchTerm ? 1 : 0);

  const renderTableView = () => (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/50">
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {visibleColumns.map((column) => (
              <TableHead 
                key={String(column.key)}
                className={column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{column.header}</span>
                  {column.sortable && (
                    <div className="flex flex-col">
                      {sortKey === column.key ? (
                        <span className="text-sm text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">↕</span>
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-16 text-center">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-12">
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-gray-500">Loading...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-12">
                {emptyState ? (
                  <div className="space-y-4">
                    <div className="text-4xl">📦</div>
                    <h3 className="text-lg font-medium text-gray-900">{emptyState.title}</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">{emptyState.description}</p>
                    {emptyState.action && (
                      <Button onClick={emptyState.action.onClick} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        {emptyState.action.label}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-2xl">🔍</div>
                    <span className="text-gray-500">No data found</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow key={row[idField]} className="hover:bg-gray-50/50 transition-colors">
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(row[idField])}
                      onCheckedChange={(checked) => handleSelectRow(row[idField], checked as boolean)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell key={String(column.key)} className="py-3">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions
                          .filter(action => !action.condition || action.condition(row))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
                              >
                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {paginatedData.map((item, index) => (
        <Card key={item[idField]} className="group relative hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
          {selectable && (
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedRows.has(item[idField])}
                onCheckedChange={(checked) => handleSelectRow(item[idField], checked as boolean)}
                className="bg-white border-2"
              />
            </div>
          )}
          
          {cardRenderer ? cardRenderer(item) : (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.name || item.title || `Item ${item[idField]}`}
                    </CardTitle>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  {actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions
                          .filter(action => !action.condition || action.condition(item))
                          .map((action, actionIndex) => {
                            const Icon = action.icon;
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={action.variant === 'destructive' ? 'text-red-600' : ''}
                              >
                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {visibleColumns.slice(0, 3).map((column) => {
                    if (column.key === 'name' || column.key === 'title' || column.key === 'description') return null;
                    
                    return (
                      <div key={String(column.key)} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">{column.header}:</span>
                        <div className="text-sm font-medium text-gray-900">
                          {column.render 
                            ? column.render(item[column.key], item)
                            : String(item[column.key] || '-')
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {(title || stats.length > 0) && (
        <div className="space-y-6">
          {title && (
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1" style={{ color: stat.color }}>
                            {stat.value}
                          </p>
                        </div>
                        {Icon && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <Icon className={`w-6 h-6 ${stat.color ? '' : 'text-blue-600'}`} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          {searchable && (
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Filters */}
          {filterable && filterFields.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filters</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  {filterFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">{field.label}</label>
                      {field.type === 'select' ? (
                        <Select
                          value={filters[field.key] || "all"}
                          onValueChange={(value) => handleFilter(field.key, value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          value={filters[field.key] || ""}
                          onChange={(e) => handleFilter(field.key, e.target.value)}
                          placeholder={`Filter by ${field.label.toLowerCase()}`}
                          className="h-8"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  {selectedRows.size} selected
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {bulkActions
                  .filter(action => !action.condition || action.condition(getSelectedRowsData()))
                  .map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          action.onClick(getSelectedRowsData());
                          setSelectedRows(new Set());
                        }}
                        className={action.variant === 'destructive' ? 'text-red-600' : ''}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Columns className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="p-2">
                <h4 className="font-medium text-sm mb-2">Toggle columns</h4>
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={String(column.key)}
                    checked={column.visible !== false}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                    className="text-sm"
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          {viewModes.length > 1 && (
            <div className="flex items-center border border-gray-300 rounded-md">
              {viewModes.map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="h-8 px-3 rounded-none first:rounded-l-md last:rounded-r-md"
                >
                  {mode === 'table' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport} className="border-gray-300">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} className="border-gray-300">
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {onAdd && (
            <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        <span>
          Showing {startIndex + 1} to {endIndex} of {filteredData.length} results
          {filteredData.length !== data.length && ` (filtered from ${data.length} total)`}
        </span>
        {selectedRows.size > 0 && (
          <span className="text-blue-600 font-medium">
            {selectedRows.size} selected
          </span>
        )}
      </div>

      {/* Data View */}
      {viewMode === 'table' ? renderTableView() : renderCardsView()}

      {/* Enhanced Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">per page</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for common column renderers
export const renderStatus = (status: string) => (
  <Badge variant={status === 'active' ? 'default' : 'secondary'} className="font-medium">
    {status}
  </Badge>
);

export const renderCurrency = (amount: number) => (
  <span className="font-mono font-medium text-green-600">${amount.toFixed(2)}</span>
);

export const renderDate = (date: string) => (
  <span className="text-gray-900">{new Date(date).toLocaleDateString()}</span>
);

export const renderBoolean = (value: boolean) => (
  <Badge variant={value ? 'default' : 'secondary'} className="font-medium">
    {value ? 'Yes' : 'No'}
  </Badge>
);

// Helper functions for common actions
export const createEditAction = <T,>(onEdit: (row: T) => void): Action<T> => ({
  label: 'Edit',
  icon: Edit,
  onClick: onEdit,
  variant: 'outline'
});

export const createDeleteAction = <T,>(onDelete: (row: T) => void): Action<T> => ({
  label: 'Delete',
  icon: Trash2,
  onClick: onDelete,
  variant: 'destructive'
});

export const createViewAction = <T,>(onView: (row: T) => void): Action<T> => ({
  label: 'View',
  icon: Eye,
  onClick: onView
});

// Helper functions for bulk actions
export const createBulkDeleteAction = <T,>(onBulkDelete: (rows: T[]) => void): BulkAction<T> => ({
  label: 'Delete Selected',
  icon: Trash2,
  onClick: onBulkDelete,
  variant: 'destructive'
});

export const createBulkEditAction = <T,>(onBulkEdit: (rows: T[]) => void): BulkAction<T> => ({
  label: 'Edit Selected',
  icon: Edit,
  onClick: onBulkEdit,
  variant: 'outline'
}); 