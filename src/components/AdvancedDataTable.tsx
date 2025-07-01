import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
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
  FileText,
  FileSpreadsheet,
  Printer,
  Package,
  BarChart3,
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
  searchable?: boolean;
  exportable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'status' | 'image' | 'link' | 'email' | 'phone';
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  tooltip?: string;
  copyable?: boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'range' | 'multiselect' | 'daterange';
  options?: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
  };
}

export interface Action<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  condition?: (row: T) => boolean;
  tooltip?: string;
  shortcut?: string;
  group?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedRows: T[], clearSelection?: () => void) => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  condition?: (selectedRows: T[]) => boolean;
  confirmMessage?: string;
  requiresConfirmation?: boolean;
  tooltip?: string;
  group?: string;
}

export interface Stats {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  clickable?: boolean;
  onClick?: () => void;
  format?: 'number' | 'currency' | 'percentage';
  comparison?: {
    value: number;
    label: string;
  };
}

export interface ExportOption {
  format: 'csv' | 'excel' | 'pdf' | 'json' | 'print';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  includeFilters?: boolean;
  customFields?: string[];
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
  onExport?: (format: string, data: T[], columns: Column<T>[]) => void | Promise<void>;
  onImport?: () => void;
  title?: string;
  subtitle?: string;
  stats?: Stats[];
  viewModes?: ('table' | 'cards' | 'list')[];
  cardRenderer?: (item: T) => React.ReactNode;
  listRenderer?: (item: T) => React.ReactNode;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  idField?: keyof T;
  selectable?: boolean;
  multiSort?: boolean;
  globalSearch?: boolean;
  quickFilters?: { key: string; value: string; label: string }[];
  exportOptions?: ExportOption[];
  density?: 'compact' | 'comfortable' | 'spacious';
  stickyHeader?: boolean;
  virtualScrolling?: boolean;
  rowSelection?: 'single' | 'multiple' | 'none';
  expandableRows?: boolean;
  rowExpansion?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  customToolbar?: React.ReactNode;
  preserveSelection?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showRowNumbers?: boolean;
  groupBy?: keyof T;
  aggregations?: { field: keyof T; type: 'sum' | 'avg' | 'count' | 'min' | 'max' }[];
}

type ViewMode = 'table' | 'cards' | 'list';
type SortConfig<T> = { key: keyof T; direction: 'asc' | 'desc' }[];

export function AdvancedDataTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  actions = [],
  bulkActions = [],
  searchable = true,
  filterable = true,
  filterFields = [],
  paginated = true,
  pageSizes = [10, 25, 50, 100, 250],
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
  listRenderer,
  emptyState,
  idField = 'id' as keyof T,
  selectable = true,
  multiSort = false,
  globalSearch = true,
  quickFilters = [],
  exportOptions = [
    { format: 'csv', label: 'CSV', icon: FileText, includeFilters: true },
    { format: 'excel', label: 'Excel', icon: FileSpreadsheet, includeFilters: true },
    { format: 'pdf', label: 'PDF', icon: FileText, includeFilters: false },
    { format: 'print', label: 'Print', icon: Printer, includeFilters: false }
  ],
  density = 'comfortable',
  stickyHeader = true,
  virtualScrolling = false,
  rowSelection = 'multiple',
  expandableRows = false,
  rowExpansion,
  onRowClick,
  onRowDoubleClick,
  customToolbar,
  preserveSelection = false,
  autoRefresh = false,
  refreshInterval = 30000,
  showRowNumbers = false,
  groupBy,
  aggregations = []
}: AdvancedDataTableProps<T>) {
  const { t } = useTranslation();
  
  // Translate export options
  const translatedExportOptions = exportOptions.map(option => ({
    ...option,
    label: t(`exportOptions.${option.format}`, option.label)
  }));
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(viewModes[0] || 'table');
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [tableDensity, setTableDensity] = useState<'compact' | 'comfortable' | 'spacious'>(density);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [quickFilterActive, setQuickFilterActive] = useState<string>('');

  // Auto refresh effect
  React.useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(onRefresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh, refreshInterval]);

  // Enhanced data filtering and searching
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Global search
      if (globalSearch && globalSearchTerm) {
        const searchableColumns = columns.filter(col => col.searchable !== false);
        const globalMatch = searchableColumns.some(col => {
          const value = row[col.key];
          return String(value || '').toLowerCase().includes(globalSearchTerm.toLowerCase());
        });
        if (!globalMatch) return false;
      }

      // Column-specific search
      if (searchTerm) {
        const searchMatch = Object.values(row).some(value => 
          String(value || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!searchMatch) return false;
      }

      // Quick filters
      if (quickFilterActive) {
        const quickFilter = quickFilters.find(qf => qf.key === quickFilterActive);
        if (quickFilter && String(row[quickFilter.key as keyof T]) !== quickFilter.value) {
          return false;
        }
      }

      // Advanced filters
      for (const [key, value] of Object.entries(filters)) {
        if (!value || value === 'all') continue;
        
        const filterField = filterFields.find(f => f.key === key);
        if (!filterField) continue;

        const rowValue = row[key as keyof T];
        
        switch (filterField.type) {
          case 'multiselect':
            if (Array.isArray(value) && value.length > 0) {
              if (!value.includes(String(rowValue))) return false;
            }
            break;
          case 'range':
            if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
              const numValue = Number(rowValue);
              if (numValue < value.min || numValue > value.max) return false;
            }
            break;
          case 'daterange':
            if (typeof value === 'object' && value.from && value.to) {
              const rowDate = new Date(String(rowValue));
              const fromDate = new Date(value.from);
              const toDate = new Date(value.to);
              if (rowDate < fromDate || rowDate > toDate) return false;
            }
            break;
          default:
            if (String(rowValue) !== String(value)) return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, globalSearchTerm, filters, quickFilterActive, columns, quickFilters, globalSearch]);

  // Enhanced sorting with multi-column support
  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        const aValue = a[key];
        const bValue = b[key];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return direction === 'asc' ? 1 : -1;
        if (bValue == null) return direction === 'asc' ? -1 : 1;
        
        // Type-specific comparisons
        const column = columns.find(col => col.key === key);
        if (column?.type === 'number' || column?.type === 'currency') {
          const numA = Number(aValue) || 0;
          const numB = Number(bValue) || 0;
          if (numA !== numB) {
            return direction === 'asc' ? numA - numB : numB - numA;
          }
        } else if (column?.type === 'date') {
          const dateA = new Date(String(aValue)).getTime();
          const dateB = new Date(String(bValue)).getTime();
          if (dateA !== dateB) {
            return direction === 'asc' ? dateA - dateB : dateB - dateA;
          }
        } else {
          const strA = String(aValue).toLowerCase();
          const strB = String(bValue).toLowerCase();
          if (strA !== strB) {
            return direction === 'asc' 
              ? strA.localeCompare(strB)
              : strB.localeCompare(strA);
          }
        }
      }
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Group data if groupBy is specified
  const groupedData = useMemo(() => {
    if (!groupBy) return { '': sortedData };
    
    return sortedData.reduce((groups, row) => {
      const groupKey = String(row[groupBy] || 'Ungrouped');
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(row);
      return groups;
    }, {} as Record<string, T[]>);
  }, [sortedData, groupBy]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);
  const paginatedData = paginated ? sortedData.slice(startIndex, endIndex) : sortedData;

  // Enhanced statistics with automatic calculations
  const enhancedStats = useMemo(() => {
    const baseStats = [...stats];

    // Auto-calculate filtered count if different
    if (filteredData.length !== data.length) {
      baseStats.push({
        label: t('table.filteredResults', 'Filtered'),
        value: filteredData.length,
        icon: Filter,
        color: 'text-purple-600',
        format: 'number' as const
      });
    }

    // Auto-calculate selected count
    if (selectedRows.size > 0) {
      baseStats.push({
        label: t('table.selectedItems', 'Selected'),
        value: selectedRows.size,
        icon: CheckSquare,
        color: 'text-green-600',
        format: 'number' as const
      });
    }

    // Auto-calculate aggregations
    aggregations.forEach(agg => {
      const values = filteredData
        .map(row => Number(row[agg.field]) || 0)
        .filter(val => !isNaN(val));
      
      let result = 0;
      switch (agg.type) {
        case 'sum':
          result = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          result = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          break;
        case 'count':
          result = values.length;
          break;
        case 'min':
          result = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          result = values.length > 0 ? Math.max(...values) : 0;
          break;
      }

      baseStats.push({
        label: t(`${agg.type}_${String(agg.field)}`, `${agg.type.toUpperCase()} ${String(agg.field)}`),
        value: result,
        icon: BarChart3,
        color: 'text-orange-600',
        format: 'number' as const
      });
    });

    return baseStats;
  }, [data, filteredData, selectedRows, stats, aggregations, t]);

  // Event handlers
  const handleSort = useCallback((key: keyof T) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(prev => {
      const existing = prev.find(s => s.key === key);
      
      if (!multiSort) {
        // Single column sort
        if (existing) {
          return existing.direction === 'asc' 
            ? [{ key, direction: 'desc' }]
            : [];
        } else {
          return [{ key, direction: 'asc' }];
        }
      } else {
        // Multi-column sort
        if (existing) {
          if (existing.direction === 'asc') {
            return prev.map(s => s.key === key ? { ...s, direction: 'desc' as const } : s);
          } else {
            return prev.filter(s => s.key !== key);
          }
        } else {
          return [...prev, { key, direction: 'asc' as const }];
        }
      }
    });
  }, [columns, multiSort]);

  const handleFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    setGlobalSearchTerm('');
    setQuickFilterActive('');
    setCurrentPage(1);
  }, []);

  const handleExport = useCallback(async (format: string) => {
    if (onExport) {
      const exportData = selectedRows.size > 0 
        ? data.filter(row => selectedRows.has(row[idField]))
        : filteredData;
      
      const exportColumns = columns.filter(col => col.exportable !== false);
      
      try {
        await onExport(format, exportData, exportColumns);
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
  }, [onExport, selectedRows, data, filteredData, columns, idField]);

  const handleBulkAction = useCallback(async (action: BulkAction<T>) => {
    const selectedData = getSelectedRowsData();
    
    if (action.requiresConfirmation && action.confirmMessage) {
      if (!window.confirm(action.confirmMessage)) return;
    }
    
    try {
      await action.onClick(selectedData, () => setSelectedRows(new Set()));
      if (!preserveSelection) {
        setSelectedRows(new Set());
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [preserveSelection]);

  const toggleColumnVisibility = useCallback((key: keyof T) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const visibleColumns = columns.filter(col => col.visible !== false);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedData.map(row => row[idField]));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  }, [paginatedData, idField]);

  const handleSelectRow = useCallback((id: string | number, checked: boolean) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  const getSelectedRowsData = useCallback(() => {
    return data.filter(row => selectedRows.has(row[idField]));
  }, [data, selectedRows, idField]);

  const toggleRowExpansion = useCallback((id: string | number) => {
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  // Helper functions for formatting
  const formatStatValue = useCallback((stat: Stats) => {
    const value = typeof stat.value === 'number' ? stat.value : parseFloat(String(stat.value)) || 0;
    
    switch (stat.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat().format(value);
      default:
        return String(stat.value);
    }
  }, []);

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'all' && (!Array.isArray(value) || value.length > 0)
  ).length + (searchTerm ? 1 : 0) + (globalSearchTerm ? 1 : 0) + (quickFilterActive ? 1 : 0);

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
                  aria-label={t('table.selectAll', 'Select all')}
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
                      {sortConfig.some(s => s.key === column.key) && (
                        <span className="text-sm text-blue-600">
                          {sortConfig.find(s => s.key === column.key)?.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-16 text-center">{t('table.actions', 'Actions')}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0) + (selectable ? 1 : 0)} className="text-center py-12">
                <div className="flex flex-col items-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-gray-500">{t('table.loadingData', 'Loading...')}</span>
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
                    <span className="text-gray-500">{t('table.noDataFound', 'No data found')}</span>
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
    <div className="space-y-6 p-4">
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
              {enhancedStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1" style={{ color: stat.color }}>
                            {formatStatValue(stat)}
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
                placeholder={t('table.searchPlaceholder', 'Search...')}
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
                  {t('tableFilters.filters', 'Filters')}
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
                    <h4 className="font-medium text-sm">{t('tableFilters.filters', 'Filters')}</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        {t('tableFilters.clearAll', 'Clear all')}
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
                            <SelectItem value="all">{t('tableFilters.selectAll', 'All')}</SelectItem>
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
                          placeholder={t('tableFilters.filterBy', 'Filter by {{field}}', { field: field.label.toLowerCase() })}
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
              {t('tableFilters.clearAllFilters', 'Clear filters')}
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
                  {t('table.selectedItems', '{{count}} selected', { count: selectedRows.size })}
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
                          handleBulkAction(action);
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
              {t('table.columns', 'Columns')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="p-2">
              <h4 className="font-medium text-sm mb-2">{t('table.toggleColumns', 'Toggle columns')}</h4>
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
                  title={t(`table.${mode}View`, `${mode.charAt(0).toUpperCase() + mode.slice(1)} View`)}
                >
                  {mode === 'table' ? <List className="w-4 h-4" /> : mode === 'cards' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </Button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="border-gray-300">
              <Download className="w-4 h-4 mr-2" />
              {t('exportOptions.exportData', 'Export')}
            </Button>
          )}
          
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport} className="border-gray-300">
              <Upload className="w-4 h-4 mr-2" />
              {t('exportOptions.importData', 'Import')}
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
              {t('table.addNew', 'Add New')}
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
        <span>
          {t('table.showingResults', 'Showing {{start}}-{{end}} of {{total}} results', {
            start: startIndex + 1,
            end: endIndex,
            total: filteredData.length
          })}
          {filteredData.length !== data.length && ` ${t('table.filteredResults', '(filtered from {{total}} total)', { total: data.length })}`}
        </span>
        {selectedRows.size > 0 && (
          <span className="text-blue-600 font-medium">
            {t('table.selectedItems', '{{count}} selected', { count: selectedRows.size })}
          </span>
        )}
      </div>

      {/* Data View */}
      {viewMode === 'table' ? renderTableView() : viewMode === 'cards' ? renderCardsView() : listRenderer ? listRenderer(paginatedData[0]) : null}

      {/* Enhanced Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">{t('tablePagination.show', 'Show')}</span>
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
            <span className="text-sm text-gray-700">{t('tablePagination.perPage', 'per page')}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
              title={t('tablePagination.goToPreviousPage', 'Go to previous page')}
            >
              <ChevronLeft className="w-4 h-4" />
              {t('tablePagination.previous', 'Previous')}
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
              title={t('tablePagination.goToNextPage', 'Go to next page')}
            >
              {t('tablePagination.next', 'Next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            {t('tablePagination.pageXofY', 'Page {{current}} of {{total}}', {
              current: currentPage,
              total: totalPages
            })}
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

export const renderCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return <span className="font-mono font-medium text-gray-400">$0.00</span>;
  }
  return (
    <span className="font-mono font-medium text-green-600">${amount.toFixed(2)}</span>
  );
};

export const renderDate = (date: string) => (
  <span className="text-gray-900">{new Date(date).toLocaleDateString()}</span>
);

export const renderBoolean = (value: boolean, t?: any) => (
  <Badge variant={value ? 'default' : 'secondary'} className="font-medium">
    {value ? (t ? t('yes', 'Yes') : 'Yes') : (t ? t('no', 'No') : 'No')}
  </Badge>
);

// Helper functions for common actions
export const createEditAction = <T,>(onEdit: (row: T) => void, t?: any): Action<T> => ({
  label: t ? t('edit', 'Edit') : 'Edit',
  icon: Edit,
  onClick: onEdit,
  variant: 'outline'
});

export const createDeleteAction = <T,>(onDelete: (row: T) => void, t?: any): Action<T> => ({
  label: t ? t('delete', 'Delete') : 'Delete',
  icon: Trash2,
  onClick: onDelete,
  variant: 'destructive'
});

export const createViewAction = <T,>(onView: (row: T) => void, t?: any): Action<T> => ({
  label: t ? t('view', 'View') : 'View',
  icon: Eye,
  onClick: onView
});

// Helper functions for bulk actions
export const createBulkDeleteAction = <T,>(onBulkDelete: (rows: T[]) => void, t?: any): BulkAction<T> => ({
  label: t ? t('table.deleteSelected', 'Delete Selected') : 'Delete Selected',
  icon: Trash2,
  onClick: onBulkDelete,
  variant: 'destructive'
});

export const createBulkEditAction = <T,>(onBulkEdit: (rows: T[]) => void, t?: any): BulkAction<T> => ({
  label: t ? t('table.editSelected', 'Edit Selected') : 'Edit Selected',
  icon: Edit,
  onClick: onBulkEdit,
  variant: 'outline'
}); 