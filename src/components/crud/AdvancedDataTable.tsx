import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  RefreshCw
} from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  width?: string;
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
}

type ViewMode = 'table' | 'cards';

export function AdvancedDataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  actions = [],
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
  emptyState
}: AdvancedDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [columns, setColumns] = useState(initialColumns);

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
        if (value && String(row[key]) !== value) {
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
  const paginatedData = paginated ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData;

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

  const toggleColumnVisibility = (key: keyof T) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = columns.filter(col => col.visible !== false);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead 
                key={String(column.key)}
                className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{ width: column.width }}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                Loading...
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-12">
                {emptyState ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">{emptyState.title}</h3>
                    <p className="text-gray-600">{emptyState.description}</p>
                    {emptyState.action && (
                      <Button onClick={emptyState.action.onClick}>
                        {emptyState.action.label}
                      </Button>
                    )}
                  </div>
                ) : (
                  'No data found'
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                {visibleColumns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
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
                                className={action.variant === 'destructive' ? 'text-red-600' : ''}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginatedData.map((item, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          {cardRenderer ? cardRenderer(item) : (
            <CardContent className="p-4">
              {visibleColumns.slice(0, 3).map((column) => (
                <div key={String(column.key)} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{column.header}:</span>
                  <span className="font-medium">
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key] || '')
                    }
                  </span>
                </div>
              ))}
              {actions.length > 0 && (
                <div className="flex space-x-2 mt-4 pt-2 border-t">
                  {actions
                    .filter(action => !action.condition || action.condition(item))
                    .slice(0, 3)
                    .map((action, actionIndex) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={actionIndex}
                          variant={action.variant || "outline"}
                          size="sm"
                          onClick={() => action.onClick(item)}
                        >
                          {Icon && <Icon className="w-4 h-4 mr-1" />}
                          {action.label}
                        </Button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      {(title || stats.length > 0) && (
        <div className="space-y-4">
          {title && (
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )}

          {/* Stats */}
          {stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold" style={{ color: stat.color }}>
                            {stat.value}
                          </p>
                        </div>
                        {Icon && <Icon className={`w-8 h-8 ${stat.color ? '' : 'text-gray-400'}`} />}
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
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          {searchable && (
            <div className="relative min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {filterable && filterFields.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {Object.values(filters).filter(Boolean).length > 0 && (
                    <Badge className="ml-2 px-1 py-0 text-xs">
                      {Object.values(filters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-4" align="start">
                <div className="space-y-3">
                  {filterFields.map((field) => (
                    <div key={field.key}>
                      <label className="text-sm font-medium">{field.label}</label>
                      {field.type === 'select' ? (
                        <Select
                          value={filters[field.key] || ""}
                          onValueChange={(value) => handleFilter(field.key, value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
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
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={String(column.key)}
                  checked={column.visible !== false}
                  onCheckedChange={() => toggleColumnVisibility(column.key)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          {viewModes.length > 1 && (
            <div className="flex items-center border rounded-md">
              {viewModes.map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="h-8 px-2"
                >
                  {mode === 'table' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          )}

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {paginatedData.length} of {filteredData.length} results
        {filteredData.length !== data.length && ` (filtered from ${data.length})`}
      </div>

      {/* Data View */}
      {viewMode === 'table' ? renderTableView() : renderCardsView()}

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-16">
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
            <span className="text-sm text-gray-600">per page</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
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
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for common column renderers
export const renderStatus = (status: string) => (
  <Badge variant={status === 'active' ? 'default' : 'secondary'}>
    {status}
  </Badge>
);

export const renderCurrency = (amount: number) => (
  <span className="font-mono">${amount.toFixed(2)}</span>
);

export const renderDate = (date: string) => (
  <span>{new Date(date).toLocaleDateString()}</span>
);

export const renderBoolean = (value: boolean) => (
  <Badge variant={value ? 'default' : 'secondary'}>
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