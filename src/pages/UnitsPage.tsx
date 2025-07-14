import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CrudPageTemplate } from "../components/CrudPageTemplate";
import { FormField, createTextField, createNumberField, createSelectField } from "../components/FormModal";
import { Column } from "../components/AdvancedDataTable";
import { Badge } from "../components/ui/badge";
import { Target, Package, CheckCircle2, Clock, Archive, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { formatNumber } from '../utils/formatters';
import { renderStatus } from '../utils/renderers';

interface Unit {
  id: number;
  name: string;
  nameEn?: string;
  symbol: string;
  type: "piece" | "weight" | "volume" | "length";
  conversionRate: number;
  baseUnitId?: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  baseUnit?: { name: string; symbol: string };
}

// Units columns configuration
const unitsColumns: Column<Record<string, any>>[] = [
  {
    key: 'name',
    header: 'Unit Name',
    sortable: true,
    filterable: true,
    searchable: true,
    exportable: true,
    sticky: true,
    width: '200px',
    render: (name: string, unit: Record<string, any>) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-mono shadow-sm">
          {unit.symbol}
        </div>
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500 capitalize">{unit.type}</div>
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
    key: 'symbol',
    header: 'Symbol',
    render: (symbol: string) => (
      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-medium">{symbol}</span>
    ),
    exportable: true
  },
  {
    key: 'type',
    header: 'Type',
    render: (type: string) => {
      const typeColors = {
        piece: 'bg-blue-100 text-blue-800',
        weight: 'bg-purple-100 text-purple-800',
        volume: 'bg-green-100 text-green-800',
        length: 'bg-orange-100 text-orange-800'
      };
      return (
        <Badge variant="outline" className={`${typeColors[type as keyof typeof typeColors]} border-0`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
    sortable: true,
    filterable: true,
    exportable: true
  },
  {
    key: 'conversionRate',
    header: 'Conversion Rate',
    render: (rate: number) => (
      <span className="font-mono text-right block">{rate.toFixed(2)}</span>
    ),
    sortable: true,
    type: 'number',
    exportable: true,
    align: 'right'
  },
  {
    key: 'baseUnit',
    header: 'Base Unit',
    render: (baseUnit: any) => baseUnit ? (
      <div className="flex items-center space-x-2">
        <span className="font-medium">{baseUnit.name}</span>
        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">({baseUnit.symbol})</span>
      </div>
    ) : <span className="text-gray-400">-</span>,
    exportable: true
  },
  {
    key: 'status',
    header: 'Status',
    render: renderStatus,
    sortable: true,
    filterable: true,
    exportable: true
  }
];

export default function UnitsPage() {
  const { t } = useTranslation();

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Enhanced columns configuration with translations
  const columns: Column<Record<string, any>>[] = useMemo(() => [
    {
      key: 'name',
      header: t('units.name', 'Unit Name'),
      sortable: true,
      filterable: true,
      searchable: true,
      exportable: true,
      sticky: true,
      width: '200px',
      render: (name: string, unit: Record<string, any>) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-mono shadow-sm">
            {unit.symbol}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500 capitalize">{unit.type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'nameEn',
      header: t('units.englishName', 'English Name'),
      render: (nameEn: string) => (
        <span className="text-gray-700">{nameEn || '-'}</span>
      ),
      exportable: true
    },
    {
      key: 'symbol',
      header: t('units.symbol', 'Symbol'),
      render: (symbol: string) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-medium">{symbol}</span>
      ),
      exportable: true
    },
    {
      key: 'type',
      header: t('units.type', 'Type'),
      render: (type: string) => {
        const typeColors = {
          piece: 'bg-blue-100 text-blue-800',
          weight: 'bg-purple-100 text-purple-800',
          volume: 'bg-green-100 text-green-800',
          length: 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge variant="outline" className={`${typeColors[type as keyof typeof typeColors]} border-0`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
      sortable: true,
      filterable: true,
      exportable: true
    },
    {
      key: 'conversionRate',
      header: t('units.conversionRate', 'Conversion Rate'),
      render: (rate: number) => (
        <span className="font-mono text-right block">{rate.toFixed(2)}</span>
      ),
      sortable: true,
      type: 'number',
      exportable: true,
      align: 'right'
    },
    {
      key: 'baseUnit',
      header: t('units.baseUnit', 'Base Unit'),
      render: (baseUnit: any) => baseUnit ? (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{baseUnit.name}</span>
          <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">({baseUnit.symbol})</span>
        </div>
      ) : <span className="text-gray-400">-</span>,
      exportable: true
    },
    {
      key: 'status',
      header: t('units.status', 'Status'),
      render: renderStatus,
      sortable: true,
      filterable: true,
      exportable: true
    }
  ], [t]);

  // Form fields with dynamic base units
  const formFields = useMemo((): FormField[] => {
    const baseUnits = units
      .filter((u) => u.status === "active")
      .map((u) => ({
        value: u.id,
        label: `${u.name} (${u.symbol})`,
      }));

    return [
      createTextField('name', t('units.name', 'Unit Name'), {
        validation: { required: true, minLength: 1, maxLength: 50 },
        placeholder: t('units.namePlaceholder', 'Enter unit name (e.g., Kilogram)'),
        width: 'half'
      }),
      createTextField('nameEn', t('units.englishName', 'English Name'), {
        placeholder: t('units.englishNamePlaceholder', 'Enter English name'),
        width: 'half'
      }),
      createTextField('symbol', t('units.symbol', 'Symbol'), {
        validation: { required: true, maxLength: 10 },
        placeholder: t('units.symbolPlaceholder', 'Enter unit symbol (e.g., kg)'),
        width: 'half'
      }),
      createSelectField('type', t('units.type', 'Type'), [
        { value: 'piece', label: t('units.piece', 'Piece') },
        { value: 'weight', label: t('units.weight', 'Weight') },
        { value: 'volume', label: t('units.volume', 'Volume') },
        { value: 'length', label: t('units.length', 'Length') }
      ], {
        validation: { required: true },
        placeholder: t('units.selectType', 'Select unit type'),
        defaultValue: 'piece',
        width: 'half'
      }),
      createNumberField('conversionRate', t('units.conversionRate', 'Conversion Rate'), {
        validation: { required: true, positive: true },
        placeholder: '1.0',
        defaultValue: 1,
        width: 'half',
        helpText: t('units.rateToConvert', 'Rate to convert to base unit')
      }),
      createSelectField('baseUnitId', t('units.baseUnit', 'Base Unit'), baseUnits, {
        placeholder: t('units.selectBaseUnit', 'Select base unit (optional)'),
        searchable: true,
        clearable: true,
        width: 'half'
      }),
      createSelectField('status', t('units.status', 'Status'), [
        { value: 'active', label: t('status.active', 'Active') },
        { value: 'inactive', label: t('status.inactive', 'Inactive') }
      ], {
        defaultValue: 'active',
        width: 'half'
      })
    ];
  }, [units, t]);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const activeUnits = units.filter((u) => u.status === "active").length;
    const unitsByType = units.reduce(
      (acc, unit) => {
        acc[unit.type] = (acc[unit.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return [
      {
        label: t("stats.totalUnits", "Total Units"),
        value: totalUnits,
        icon: Target,
        color: "text-indigo-600",
        format: "number" as const,
        clickable: true,
      },
      {
        label: t("stats.activeUnits", "Active Units"),
        value: activeUnits,
        icon: Target,
        color: "text-green-600",
        format: "number" as const,
        comparison: {
          value:
            totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0,
          label: t("stats.ofTotal", "of total"),
        },
      },
      {
        label: t("stats.pieceUnits", "Piece Units"),
        value: unitsByType.piece || 0,
        icon: Target,
        color: "text-blue-600",
        format: "number" as const,
      },
      {
        label: t("stats.weightUnits", "Weight Units"),
        value: unitsByType.weight || 0,
        icon: Target,
        color: "text-purple-600",
        format: "number" as const,
      },
    ];
  }, [units, t]);

  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);

      const unitData = {
        ...formData,
        conversionRate: parseFloat(formData.conversionRate) || 1,
        baseUnitId: formData.baseUnitId || null,
      };

      const response = await window.database.units.create(unitData);
      if (!response.success) throw new Error(response.error);

      setUnits((prev) => [...prev, response.data]);
      toast.success(t("messages.unitCreated", "Unit created successfully"));
      return response.data;
    } catch (error) {
      console.error("Failed to create unit:", error);
      toast.error(t("messages.createError", "Failed to create unit"));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (
    id: string | number,
    formData: Record<string, any>,
  ) => {
    try {
      setLoading(true);

      const unitData = {
        ...formData,
        conversionRate: parseFloat(formData.conversionRate) || 1,
        baseUnitId: formData.baseUnitId || null,
      };

      const response = await window.database.units.update(Number(id), unitData);
      if (!response.success) throw new Error(response.error);

      setUnits((prev) => prev.map((u) => (u.id === id ? response.data : u)));
      toast.success(t("messages.unitUpdated", "Unit updated successfully"));
      return response.data;
    } catch (error) {
      console.error("Failed to update unit:", error);
      toast.error(t("messages.updateError", "Failed to update unit"));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);

      const response = await window.database.units.delete(Number(id));
      if (!response.success) throw new Error(response.error);

      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success(t("messages.unitDeleted", "Unit deleted successfully"));
    } catch (error) {
      console.error("Failed to delete unit:", error);
      toast.error(t("messages.deleteError", "Failed to delete unit"));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);

      await Promise.all(
        ids.map((id) => window.database.units.delete(Number(id))),
      );
      setUnits((prev) => prev.filter((u) => !ids.includes(u.id)));
      toast.success(
        t("messages.unitsDeleted", "{{count}} units deleted successfully", {
          count: ids.length,
        }),
      );
    } catch (error) {
      console.error("Failed to delete units:", error);
      toast.error(t("messages.bulkDeleteError", "Failed to delete units"));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await window.database.units.getAll();
      if (!response.success) throw new Error(response.error);

      setUnits(response.data || []);
    } catch (error) {
      console.error("Failed to fetch units:", error);
      setError(t("messages.fetchError", "Failed to load units"));
      toast.error(t("messages.fetchError", "Failed to load units"));
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    handleRefresh();
  }, []);

  // Enhanced card renderer
  const cardRenderer = (unit: Record<string, any>) => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-mono text-lg shadow-md">
            {unit.symbol}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{unit.name}</h3>
            {unit.nameEn && (
              <p className="text-sm text-gray-500">{unit.nameEn}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          {renderStatus(unit.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <span className="text-gray-500 font-medium">{t('units.type', 'Type')}:</span>
          <div>{unitsColumns[3].render?.(unit.type, unit)}</div>
        </div>
        <div className="space-y-1">
          <span className="text-gray-500 font-medium">{t('units.conversionRate', 'Conversion Rate')}:</span>
          <div className="font-mono">{unit.conversionRate.toFixed(2)}</div>
        </div>
      </div>

      {unit.baseUnit && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{t('units.baseUnit', 'Base Unit')}:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{unit.baseUnit.name}</span>
              <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">({unit.baseUnit.symbol})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <CrudPageTemplate
      data={units}
      loading={loading}
      error={error}
      entityName="unit"
      entityNamePlural="units"
      entityConfig={{
        icon: Target,
        color: "text-indigo-600",
        description: t("units.description", "Manage measurement units for products"),
        category: "configuration",
      }}
      columns={columns}
      stats={stats}
      formFields={formFields}
      cardRenderer={cardRenderer}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
    />
  );
}
