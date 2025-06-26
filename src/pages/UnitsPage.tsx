import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CrudPageTemplate } from '../components/CrudPageTemplate';
import { crudConfigurations } from '../components/enhanced-crud-configs';
import { toast } from 'react-hot-toast';

interface Unit {
  id: number;
  name: string;
  nameEn?: string;
  symbol: string;
  type: 'piece' | 'weight' | 'volume' | 'length';
  conversionRate: number;
  baseUnitId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  baseUnit?: { name: string; symbol: string };
}

export default function UnitsPage() {
  const { t } = useTranslation();
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const config = crudConfigurations.units;

  const formFields = useMemo(() => {
    const baseUnits = units.filter(u => u.status === 'active').map(u => ({
      value: u.id,
      label: `${u.name} (${u.symbol})`
    }));

    return config.formFields.map(field => {
      if (field.key === 'baseUnitId') {
        return {
          ...field,
          options: baseUnits
        };
      }
      return field;
    });
  }, [units, config.formFields]);

  const stats = useMemo(() => {
    const totalUnits = units.length;
    const activeUnits = units.filter(u => u.status === 'active').length;
    const unitsByType = units.reduce((acc, unit) => {
      acc[unit.type] = (acc[unit.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      {
        label: t('stats.totalUnits', 'Total Units'),
        value: totalUnits,
        icon: config.entityConfig.icon,
        color: config.entityConfig.color,
        format: 'number' as const,
        clickable: true
      },
      {
        label: t('stats.activeUnits', 'Active Units'),
        value: activeUnits,
        icon: config.entityConfig.icon,
        color: 'text-green-600',
        format: 'number' as const,
        comparison: {
          value: totalUnits > 0 ? Math.round((activeUnits / totalUnits) * 100) : 0,
          label: t('stats.ofTotal', 'of total')
        }
      },
      {
        label: t('stats.pieceUnits', 'Piece Units'),
        value: unitsByType.piece || 0,
        icon: config.entityConfig.icon,
        color: 'text-blue-600',
        format: 'number' as const
      },
      {
        label: t('stats.weightUnits', 'Weight Units'),
        value: unitsByType.weight || 0,
        icon: config.entityConfig.icon,
        color: 'text-purple-600',
        format: 'number' as const
      }
    ];
  }, [units, t, config]);

  const handleAdd = async (formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const unitData = {
        ...formData,
        conversionRate: parseFloat(formData.conversionRate) || 1,
        baseUnitId: formData.baseUnitId || null
      };

      const response = await window.database.units.create(unitData);
      if (!response.success) throw new Error(response.error);
      
      setUnits(prev => [...prev, response.data]);
      toast.success(t('messages.unitCreated', 'Unit created successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to create unit:', error);
      toast.error(t('messages.createError', 'Failed to create unit'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string | number, formData: Record<string, any>) => {
    try {
      setLoading(true);
      
      const unitData = {
        ...formData,
        conversionRate: parseFloat(formData.conversionRate) || 1,
        baseUnitId: formData.baseUnitId || null
      };

      const response = await window.database.units.update(Number(id), unitData);
      if (!response.success) throw new Error(response.error);
      
      setUnits(prev => prev.map(u => u.id === id ? response.data : u));
      toast.success(t('messages.unitUpdated', 'Unit updated successfully'));
      return response.data;
    } catch (error) {
      console.error('Failed to update unit:', error);
      toast.error(t('messages.updateError', 'Failed to update unit'));
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
      
      setUnits(prev => prev.filter(u => u.id !== id));
      toast.success(t('messages.unitDeleted', 'Unit deleted successfully'));
    } catch (error) {
      console.error('Failed to delete unit:', error);
      toast.error(t('messages.deleteError', 'Failed to delete unit'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    try {
      setLoading(true);
      
      await Promise.all(ids.map(id => window.database.units.delete(Number(id))));
      setUnits(prev => prev.filter(u => !ids.includes(u.id)));
      toast.success(t('messages.unitsDeleted', '{{count}} units deleted successfully', { count: ids.length }));
    } catch (error) {
      console.error('Failed to delete units:', error);
      toast.error(t('messages.bulkDeleteError', 'Failed to delete units'));
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
      console.error('Failed to fetch units:', error);
      setError(t('messages.fetchError', 'Failed to load units'));
      toast.error(t('messages.fetchError', 'Failed to load units'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const cardRenderer = (unit: Unit) => (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-mono">
            {unit.symbol}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{unit.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{unit.type}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Symbol:</span>
          <div className="font-mono bg-gray-100 px-2 py-1 rounded text-sm inline-block">{unit.symbol}</div>
        </div>
        <div>
          <span className="text-gray-500">Conversion Rate:</span>
          <div className="font-medium">{unit.conversionRate}</div>
        </div>
        {unit.baseUnit && (
          <div className="col-span-2">
            <span className="text-gray-500">Base Unit:</span>
            <div className="font-medium">{unit.baseUnit.name} ({unit.baseUnit.symbol})</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CrudPageTemplate
      data={units}
      loading={loading}
      error={error}
      
      entityName="unit"
      entityNamePlural="units"
      entityConfig={config.entityConfig}
      
      columns={config.columns}
      filterFields={config.filterFields}
      stats={stats}
      
      searchable={true}
      filterable={true}
      sortable={true}
      paginated={true}
      selectable={true}
      exportable={true}
      
      viewModes={['table', 'cards']}
      defaultViewMode="table"
      cardRenderer={cardRenderer}
      
      formFields={formFields}
      formSections={[
        {
          title: t('sections.basicInfo', 'Basic Information'),
          fields: ['name', 'nameEn', 'symbol']
        },
        {
          title: t('sections.unitType', 'Unit Type & Conversion'),
          fields: ['type', 'conversionRate', 'baseUnitId']
        },
        {
          title: t('sections.status', 'Status'),
          fields: ['status']
        }
      ]}
      
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      onRefresh={handleRefresh}
      
      title={t('units.title', 'Units')}
      subtitle={t('units.subtitle', 'Measurement units for products')}
      
      enableAnalytics={true}
      idField="id"
      titleField="name"
      statusField="status"
      dateField="createdAt"
      
      autoRefresh={true}
      refreshInterval={60000}
      preserveSelection={false}
      density="comfortable"
    />
  );
}