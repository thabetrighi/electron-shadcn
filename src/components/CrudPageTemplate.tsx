import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  AdvancedDataTable,
  Column,
  Action,
  BulkAction,
  Stats,
  FilterField,
  ExportOption,
} from "./AdvancedDataTable";
import { FormModal, FormField } from "./FormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import toast from "react-hot-toast";
import { exportData, createBulkOperations } from "../utils/export";
import {
  Package,
  Edit,
  Trash2,
  Eye,
  Copy,
  Archive,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Activity,
  Users,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  Calendar,
} from "lucide-react";

// Enhanced interfaces for better type safety and functionality
interface CrudPageTemplateProps<T> {
  // Core data
  data: T[];
  loading?: boolean;
  error?: string;

  // Entity configuration
  entityName: string;
  entityNamePlural: string;
  entityConfig?: {
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    description?: string;
    category?: string;
    permissions?: {
      create?: boolean;
      read?: boolean;
      update?: boolean;
      delete?: boolean;
      export?: boolean;
      import?: boolean;
      bulkActions?: boolean;
    };
  };

  // Table configuration
  columns: Column<T>[];
  filterFields?: FilterField[];
  stats?: Stats[];

  // Display options
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  importable?: boolean;

  // View modes
  viewModes?: ("table" | "cards" | "list")[];
  defaultViewMode?: "table" | "cards" | "list";
  cardRenderer?: (item: T) => React.ReactNode;
  listRenderer?: (item: T) => React.ReactNode;

  // Form configuration
  formFields: FormField[];
  formSections?: { title: string; fields: string[]; collapsible?: boolean }[];
  formValidation?: (
    data: Record<string, any>,
  ) => Promise<Record<string, string>>;

  // CRUD operations
  onAdd: (data: Record<string, any>) => Promise<T>;
  onEdit: (id: string | number, data: Record<string, any>) => Promise<T>;
  onDelete: (id: string | number) => Promise<void>;
  onBulkDelete?: (ids: (string | number)[]) => Promise<void>;
  onBulkEdit?: (
    ids: (string | number)[],
    data: Record<string, any>,
  ) => Promise<void>;
  onDuplicate?: (id: string | number) => Promise<T>;
  onArchive?: (id: string | number) => Promise<void>;
  onRestore?: (id: string | number) => Promise<void>;

  // Data operations
  onRefresh?: () => Promise<void>;
  onExport?: (format: string, data: T[], columns: Column<T>[]) => Promise<void>;
  onImport?: (file: File) => Promise<void>;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (field: keyof T, direction: "asc" | "desc") => void;

  // Customization
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  customActions?: Action<T>[];
  customBulkActions?: BulkAction<T>[];
  customStats?: Stats[];
  customFilters?: FilterField[];
  customToolbar?: React.ReactNode;

  // Advanced features
  enableAnalytics?: boolean;
  enableAuditLog?: boolean;
  enableComments?: boolean;
  enableRatings?: boolean;
  enableWorkflow?: boolean;
  enableNotifications?: boolean;
  enableCollaboration?: boolean;

  // Configuration
  idField?: keyof T;
  titleField?: keyof T;
  statusField?: keyof T;
  dateField?: keyof T;
  userField?: keyof T;

  // Layout and styling
  layout?: "default" | "compact" | "comfortable" | "spacious";
  theme?: "light" | "dark" | "auto";
  density?: "compact" | "comfortable" | "spacious";

  // Behavior
  autoRefresh?: boolean;
  refreshInterval?: number;
  preserveSelection?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableDragAndDrop?: boolean;
  enableInlineEditing?: boolean;

  // Integration
  integrations?: {
    email?: boolean;
    sms?: boolean;
    slack?: boolean;
    webhook?: boolean;
  };
}

export function CrudPageTemplate<T extends Record<string, any>>({
  data,
  loading = false,
  error,
  entityName,
  entityNamePlural,
  entityConfig = {},
  columns,
  filterFields = [],
  stats = [],
  searchable = true,
  filterable = true,
  sortable = true,
  paginated = true,
  selectable = true,
  exportable = true,
  importable = false,
  viewModes = ["table", "cards"],
  defaultViewMode = "table",
  cardRenderer,
  listRenderer,
  formFields,
  formSections = [],
  formValidation,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onRefresh,
  onExport,
  onImport,
  onSearch,
  onFilter,
  onSort,
  title,
  subtitle,
  headerActions,
  customActions = [],
  customBulkActions = [],
  customStats = [],
  customFilters = [],
  customToolbar,
  enableAnalytics = false,
  enableAuditLog = false,
  enableComments = false,
  enableRatings = false,
  enableWorkflow = false,
  enableNotifications = false,
  enableCollaboration = false,
  idField = "id" as keyof T,
  titleField = "name" as keyof T,
  statusField = "status" as keyof T,
  dateField = "createdAt" as keyof T,
  userField = "userId" as keyof T,
  layout = "default",
  theme = "light",
  density = "comfortable",
  autoRefresh = false,
  refreshInterval = 30000,
  preserveSelection = false,
  enableKeyboardShortcuts = true,
  enableDragAndDrop = false,
  enableInlineEditing = false,
  integrations = {},
}: CrudPageTemplateProps<T>) {
  const { t } = useTranslation();

  // Helper functions (moved to top to avoid hoisting issues)
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return CheckCircle2;
      case "inactive":
        return Clock;
      case "pending":
        return Clock;
      case "draft":
        return Edit;
      case "published":
        return CheckCircle2;
      case "archived":
        return Archive;
      case "deleted":
        return Trash2;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-gray-600";
      case "pending":
        return "text-yellow-600";
      case "draft":
        return "text-blue-600";
      case "published":
        return "text-green-600";
      case "archived":
        return "text-gray-600";
      case "deleted":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Form states
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);
  const [bulkDeleteItems, setBulkDeleteItems] = useState<T[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // UI states
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );
  const [viewMode, setViewMode] = useState(defaultViewMode);
  const [activeTab, setActiveTab] = useState("data");

  // Enhanced permissions based on entity config
  const permissions = {
    create: true,
    read: true,
    update: true,
    delete: true,
    export: exportable,
    import: importable,
    bulkActions: true,
    ...entityConfig.permissions,
  };

  // Enhanced statistics calculations
  const enhancedStats = useMemo(() => {
    const baseStats: Stats[] = [
      {
        label: t("stats.total", "Total {{entity}}", {
          entity: t(`${entityNamePlural}.title`),
        }),
        value: data.length,
        icon: entityConfig.icon || Package,
        color: entityConfig.color || "text-blue-600",
        format: "number" as const,
        clickable: true,
        onClick: () => setActiveTab("data"),
      },
    ];

    // Status-based stats
    if (data.length > 0 && statusField && statusField in data[0]) {
      const statusCounts = data.reduce(
        (acc, item) => {
          const status = String(item[statusField] || "unknown");
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      Object.entries(statusCounts).forEach(([status, count]) => {
        baseStats.push({
          label: t(
            `stats.${status}`,
            status.charAt(0).toUpperCase() + status.slice(1),
          ),
          value: count,
          icon: getStatusIcon(status),
          color: getStatusColor(status),
          format: "number" as const,
          comparison: {
            value: Math.round((count / data.length) * 100),
            label: t("stats.percentage", "of total"),
          },
        });
      });
    }

    // Time-based stats
    if (data.length > 0 && dateField && dateField in data[0]) {
      const now = new Date();
      const thisMonth = data.filter((item) => {
        const itemDate = new Date(String(item[dateField]));
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }).length;

      const lastMonth = data.filter((item) => {
        const itemDate = new Date(String(item[dateField]));
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return (
          itemDate.getMonth() === lastMonthDate.getMonth() &&
          itemDate.getFullYear() === lastMonthDate.getFullYear()
        );
      }).length;

      baseStats.push({
        label: t("stats.thisMonth", "This Month"),
        value: thisMonth,
        icon: Calendar,
        color: "text-green-600",
        format: "number" as const,
        trend:
          lastMonth > 0
            ? {
                value: Math.round(((thisMonth - lastMonth) / lastMonth) * 100),
                direction: thisMonth >= lastMonth ? "up" : "down",
                label: t("stats.vsLastMonth", "vs last month"),
              }
            : undefined,
      });
    }

    // Selected items stats
    if (selectedRows.size > 0) {
      baseStats.push({
        label: t("stats.selected", "Selected"),
        value: selectedRows.size,
        icon: CheckCircle2,
        color: "text-purple-600",
        format: "number" as const,
      });
    }

    // Custom stats
    return [...baseStats, ...customStats, ...stats];
  }, [
    data,
    selectedRows,
    statusField,
    dateField,
    entityConfig,
    entityNamePlural,
    customStats,
    stats,
    t,
  ]);

  // Enhanced actions with permissions
  const enhancedActions = useMemo(() => {
    const baseActions: Action<T>[] = [];

    if (permissions.read) {
      baseActions.push({
        label: t("actions.view", "View"),
        icon: Eye,
        onClick: (item) => handleView(item),
        variant: "outline",
      });
    }

    if (permissions.update) {
      baseActions.push({
        label: t("actions.edit", "Edit"),
        icon: Edit,
        onClick: (item) => handleEdit(item),
        variant: "outline",
      });
    }

    if (onDuplicate) {
      baseActions.push({
        label: t("actions.duplicate", "Duplicate"),
        icon: Copy,
        onClick: (item) => handleDuplicate(item),
        variant: "outline",
      });
    }

    if (onArchive) {
      baseActions.push({
        label: t("actions.archive", "Archive"),
        icon: Archive,
        onClick: (item) => handleArchive(item),
        variant: "outline",
        condition: (item) => item[statusField] !== "archived",
      });
    }

    if (onRestore) {
      baseActions.push({
        label: t("actions.restore", "Restore"),
        icon: RefreshCw,
        onClick: (item) => handleRestore(item),
        variant: "outline",
        condition: (item) => item[statusField] === "archived",
      });
    }

    if (permissions.delete) {
      baseActions.push({
        label: t("actions.delete", "Delete"),
        icon: Trash2,
        onClick: (item) => handleDeleteClick(item),
        variant: "destructive",
      });
    }

    return [...baseActions, ...customActions];
  }, [permissions, onDuplicate, onArchive, onRestore, customActions, t]);

  // Enhanced bulk actions
  const enhancedBulkActions = useMemo(() => {
    const bulkOps = createBulkOperations<T>();
    const baseBulkActions: BulkAction<T>[] = [];

    if (permissions.export) {
      baseBulkActions.push({
        label: t("bulkActions.exportSelected", "Export Selected"),
        icon: Download,
        onClick: (selectedItems) =>
          bulkOps.export(selectedItems, columns, "csv"),
        variant: "outline",
      });

      baseBulkActions.push({
        label: t("bulkActions.copySelected", "Copy Selected"),
        icon: Copy,
        onClick: (selectedItems) => {
          bulkOps.copy(selectedItems, columns);
          toast.success(
            t("bulkActions.copiedToClipboard", "Copied to clipboard"),
          );
        },
        variant: "outline",
      });
    }

    if (onBulkEdit && permissions.update) {
      baseBulkActions.push({
        label: t("bulkActions.editSelected", "Edit Selected"),
        icon: Edit,
        onClick: (selectedItems) => handleBulkEdit(selectedItems),
        variant: "outline",
      });
    }

    if (onArchive) {
      baseBulkActions.push({
        label: t("bulkActions.archiveSelected", "Archive Selected"),
        icon: Archive,
        onClick: (selectedItems) => handleBulkArchive(selectedItems),
        variant: "outline",
        condition: (selectedItems) =>
          selectedItems.some((item) => item[statusField] !== "archived"),
      });
    }

    if (onBulkDelete && permissions.delete) {
      baseBulkActions.push({
        label: t("table.deleteSelected", "Delete Selected"),
        icon: Trash2,
        onClick: (selectedItems) => handleBulkDeleteClick(selectedItems),
        variant: "destructive",
        requiresConfirmation: true,
        confirmMessage: t(
          "bulkActions.deleteConfirmation",
          "Are you sure you want to delete items?",
        ),
      });
    }

    return [...baseBulkActions, ...customBulkActions];
  }, [
    permissions,
    onBulkEdit,
    onBulkDelete,
    onArchive,
    columns,
    customBulkActions,
    t,
  ]);

  // Enhanced export options
  const exportOptions: ExportOption[] = [
    { format: "csv", label: "CSV", icon: FileText, includeFilters: true },
    {
      format: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      includeFilters: true,
    },
    { format: "pdf", label: "PDF", icon: FileText, includeFilters: false },
    { format: "json", label: "JSON", icon: FileText, includeFilters: true },
    { format: "print", label: "Print", icon: Printer, includeFilters: false },
  ];

  // Currency formatting utility
  const formatCurrency = useCallback((amount: number, currency = "USD") => {
    return new Intl.NumberFormat(navigator.language || "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  // Event handlers
  const handleAdd = useCallback(() => {
    if (!permissions.create) return;
    setEditingItem(null);
    setIsFormModalOpen(true);
  }, [permissions.create]);

  const handleEdit = useCallback(
    (item: T) => {
      if (!permissions.update) return;
      setEditingItem(item);
      setIsFormModalOpen(true);
    },
    [permissions.update],
  );

  const handleView = useCallback((item: T) => {
    // Implement view logic - could open a modal, navigate to detail page, etc.
    console.log("Viewing item:", item);
  }, []);

  const handleDuplicate = useCallback(
    async (item: T) => {
      if (!onDuplicate) return;

      try {
        const duplicatedItem = await onDuplicate(item[idField]);
        toast.success(
          t("messages.duplicateSuccess", "{{entity}} duplicated successfully", {
            entity: t(entityName),
          }),
        );
        if (onRefresh) await onRefresh();
      } catch (error) {
        toast.error(
          t("messages.duplicateError", "Failed to duplicate {{entity}}", {
            entity: t(entityName),
          }),
        );
        console.error("Duplicate error:", error);
      }
    },
    [onDuplicate, idField, entityName, onRefresh, t],
  );

  const handleArchive = useCallback(
    async (item: T) => {
      if (!onArchive) return;

      try {
        await onArchive(item[idField]);
        toast.success(
          t("messages.archiveSuccess", "{{entity}} archived successfully", {
            entity: t(entityName),
          }),
        );
        if (onRefresh) await onRefresh();
      } catch (error) {
        toast.error(
          t("messages.archiveError", "Failed to archive {{entity}}", {
            entity: t(entityName),
          }),
        );
        console.error("Archive error:", error);
      }
    },
    [onArchive, idField, entityName, onRefresh, t],
  );

  const handleRestore = useCallback(
    async (item: T) => {
      if (!onRestore) return;

      try {
        await onRestore(item[idField]);
        toast.success(
          t("messages.restoreSuccess", "{{entity}} restored successfully", {
            entity: t(entityName),
          }),
        );
        if (onRefresh) await onRefresh();
      } catch (error) {
        toast.error(
          t("messages.restoreError", "Failed to restore {{entity}}", {
            entity: t(entityName),
          }),
        );
        console.error("Restore error:", error);
      }
    },
    [onRestore, idField, entityName, onRefresh, t],
  );

  const handleDeleteClick = useCallback((item: T) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleBulkEdit = useCallback((selectedItems: T[]) => {
    // Implement bulk edit logic
    console.log("Bulk editing items:", selectedItems);
  }, []);

  const handleBulkArchive = useCallback(
    async (selectedItems: T[]) => {
      if (!onArchive) return;

      try {
        await Promise.all(
          selectedItems.map((item) => onArchive(item[idField])),
        );
        toast.success(
          t(
            "messages.bulkArchiveSuccess",
            "{{count}} items archived successfully",
            { count: selectedItems.length },
          ),
        );
        setSelectedRows(new Set());
        if (onRefresh) await onRefresh();
      } catch (error) {
        toast.error(t("messages.bulkArchiveError", "Failed to archive items"));
        console.error("Bulk archive error:", error);
      }
    },
    [onArchive, idField, onRefresh, t],
  );

  const handleBulkDeleteClick = useCallback((selectedItems: T[]) => {
    setBulkDeleteItems(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (formData: Record<string, any>) => {
      setSubmitting(true);
      try {
        // Custom validation
        if (formValidation) {
          const validationErrors = await formValidation(formData);
          if (Object.keys(validationErrors).length > 0) {
            // Handle validation errors
            setSubmitting(false);
            return;
          }
        }

        if (editingItem) {
          await onEdit(editingItem[idField], formData);
          toast.success(
            t("messages.updateSuccess", "{{entity}} updated successfully", {
              entity: t(entityName),
            }),
          );
        } else {
          await onAdd(formData);
          toast.success(
            t("messages.createSuccess", "{{entity}} created successfully", {
              entity: t(entityName),
            }),
          );
        }

        setIsFormModalOpen(false);
        if (onRefresh) await onRefresh();
      } catch (error) {
        toast.error(t("messages.error", "An error occurred"));
        console.error("CRUD operation error:", error);
      } finally {
        setSubmitting(false);
      }
    },
    [
      editingItem,
      idField,
      onEdit,
      onAdd,
      onRefresh,
      formValidation,
      entityName,
      t,
    ],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    try {
      await onDelete(deletingItem[idField]);
      toast.success(
        t("messages.deleteSuccess", "{{entity}} deleted successfully", {
          entity: t(entityName),
        }),
      );
      setIsDeleteDialogOpen(false);
      if (onRefresh) await onRefresh();
    } catch (error) {
      toast.error(
        t("messages.deleteError", "Failed to delete {{entity}}", {
          entity: t(entityName),
        }),
      );
      console.error("Delete error:", error);
    } finally {
      setSubmitting(false);
      setDeletingItem(null);
    }
  }, [deletingItem, idField, onDelete, onRefresh, entityName, t]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!onBulkDelete || bulkDeleteItems.length === 0) return;

    setSubmitting(true);
    try {
      const ids = bulkDeleteItems.map((item) => item[idField]);
      await onBulkDelete(ids);
      toast.success(
        t(
          "messages.bulkDeleteSuccess",
          "{{count}} items deleted successfully",
          { count: bulkDeleteItems.length },
        ),
      );
      setIsBulkDeleteDialogOpen(false);
      setSelectedRows(new Set());
      if (onRefresh) await onRefresh();
    } catch (error) {
      toast.error(t("messages.bulkDeleteError", "Failed to delete items"));
      console.error("Bulk delete error:", error);
    } finally {
      setSubmitting(false);
      setBulkDeleteItems([]);
    }
  }, [onBulkDelete, bulkDeleteItems, idField, onRefresh, t]);

  const handleExport = useCallback(
    async (format: string, dataToExport: T[], exportColumns: Column<T>[]) => {
      if (onExport) {
        await onExport(format, dataToExport, exportColumns);
      } else {
        // Use default export utility
        exportData(format, dataToExport, exportColumns, {
          title: title || t(`${entityNamePlural}.title`),
          subtitle: subtitle,
          filename: `${entityNamePlural}_${new Date().toISOString().split("T")[0]}`,
        });
      }
    },
    [onExport, title, subtitle, entityNamePlural, t],
  );

  // Empty state configuration
  const emptyState = {
    title: t(
      `no${entityNamePlural.charAt(0).toUpperCase() + entityNamePlural.slice(1)}`,
      `No ${entityNamePlural} yet`,
    ),
    description: t(
      "emptyState.description",
      "Get started by adding your first {{entity}}",
      { entity: t(entityName) },
    ),
    icon: entityConfig.icon,
    action: permissions.create
      ? {
          label: t(
            `add${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
            `Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
          ),
          onClick: handleAdd,
        }
      : undefined,
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              {t("error.title", "Error")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{error}</p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("actions.retry", "Try Again")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {entityConfig.icon && (
            <div
              className={`rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-3 shadow-sm ${entityConfig.color || "text-blue-600"}`}
            >
              <entityConfig.icon className="h-7 w-7" />
            </div>
          )}
          <div>
            <h1 className="mb-1 text-4xl font-bold tracking-tight text-gray-900">
              {title || t(`${entityNamePlural}.title`)}
            </h1>
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
            {entityConfig.description && (
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                {entityConfig.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {headerActions}
          {autoRefresh && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-xs text-green-700"
            >
              <Activity className="mr-1 h-3 w-3" />
              {t("autoRefresh", "Auto-refresh")}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <AdvancedDataTable
          data={data}
          columns={columns}
          actions={enhancedActions}
          bulkActions={enhancedBulkActions}
          loading={loading}
          searchable={searchable}
          filterable={filterable}
          filterFields={[...filterFields, ...customFilters]}
          stats={enhancedStats}
          title={title}
          subtitle={subtitle}
          onAdd={permissions.create ? handleAdd : undefined}
          onRefresh={onRefresh}
          onExport={permissions.export ? handleExport : undefined}
          onImport={
            permissions.import ? () => setIsImportModalOpen(true) : undefined
          }
          emptyState={emptyState}
          cardRenderer={cardRenderer}
          listRenderer={listRenderer}
          viewModes={viewModes}
          idField={idField}
          selectable={selectable && permissions.bulkActions}
          paginated={paginated}
          density={density}
          autoRefresh={autoRefresh}
          refreshInterval={refreshInterval}
          preserveSelection={preserveSelection}
          exportOptions={exportOptions}
          customToolbar={customToolbar}
        />
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        title={
          editingItem
            ? t(
                `edit${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
                `Edit ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
              )
            : t(
                `add${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
                `Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
              )
        }
        fields={formFields}
        sections={formSections}
        initialData={editingItem || {}}
        loading={submitting}
        submitLabel={
          editingItem
            ? t("actions.update", "Update")
            : t("actions.create", "Create")
        }
        cancelLabel={t("actions.cancel", "Cancel")}
        size="lg"
        validateOnChange={true}
        showProgress={false}
        confirmClose={true}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(
                `delete${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
                `Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "deleteConfirmation",
                "Are you sure you want to delete this {{entity}}? This action cannot be undone.",
                { entity: t(entityName) },
              )}
              {deletingItem && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-red-600" />
                    <strong className="text-red-800">
                      {deletingItem[titleField] ||
                        `${t(entityName)} #${deletingItem[idField]}`}
                    </strong>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t("actions.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("actions.deleting", "Deleting...")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("actions.delete", "Delete")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("bulkDelete.title", "Delete Multiple Items")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "bulkDelete.confirmation",
                "Are you sure you want to delete {{count}} items? This action cannot be undone.",
                { count: bulkDeleteItems.length },
              )}
              <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3">
                {bulkDeleteItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center py-1">
                    <AlertCircle className="mr-2 h-3 w-3 flex-shrink-0 text-red-600" />
                    <span className="text-sm text-red-800">
                      {item[titleField] || `${t(entityName)} #${item[idField]}`}
                    </span>
                  </div>
                ))}
                {bulkDeleteItems.length > 5 && (
                  <div className="mt-1 text-sm text-red-600">
                    {t("bulkDelete.andMore", "and {{count}} more...", {
                      count: bulkDeleteItems.length - 5,
                    })}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              {t("actions.cancel", "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("actions.deleting", "Deleting...")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("bulkDelete.deleteAll", "Delete All")}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper functions for creating entity configurations
export const createEntityConfig = (config: {
  name: string;
  namePlural: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  description?: string;
  category?: string;
}) => config;

// Pre-built entity configurations
export const productEntityConfig = createEntityConfig({
  name: "product",
  namePlural: "products",
  icon: Package,
  color: "text-blue-600",
  description: "Manage your product catalog",
  category: "inventory",
});

export const userEntityConfig = createEntityConfig({
  name: "user",
  namePlural: "users",
  icon: Users,
  color: "text-green-600",
  description: "Manage system users",
  category: "administration",
});

export const orderEntityConfig = createEntityConfig({
  name: "order",
  namePlural: "orders",
  icon: ShoppingCart,
  color: "text-purple-600",
  description: "Manage customer orders",
  category: "sales",
});

export const categoryEntityConfig = createEntityConfig({
  name: "category",
  namePlural: "categories",
  icon: Archive,
  color: "text-orange-600",
  description: "Organize your products",
  category: "organization",
});

export const unitEntityConfig = createEntityConfig({
  name: "unit",
  namePlural: "units",
  icon: Target,
  color: "text-indigo-600",
  description: "Measurement units for products",
  category: "configuration",
});

// Export everything for easy importing
export type { CrudPageTemplateProps };
export { CrudPageTemplate as default };
