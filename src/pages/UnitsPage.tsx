import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AdvancedDataTable } from '../components/AdvancedDataTable';
import { FormModal } from '../components/FormModal';
import { useUnits } from '../hooks/useCrud';
import { createExporter, type ExportColumn } from '../utils/export';
import { 
  Plus, 
  Scale, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Printer,
  Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { Unit, NewUnit } from '../database/schema';

export default function UnitsPage() {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const {
    items: units,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    refresh
  } = useUnits();

  // Statistics
  const stats = useMemo(() => {
    const totalUnits = units.length;
    const activeUnits = units.filter(u => u.status === 'active').length;
    const unitTypes = [...new Set(units.map(u => u.type))].length;
    const baseUnits = units.filter(u => !u.baseUnit).length;

    return {
      totalUnits,
      activeUnits,
      unitTypes,
      baseUnits
    };
  }, [units]);

  // Form configuration
  const unitFormFields = [
    {
      name: 'name',
      label: t('units.name'),
      type: 'text' as const,
      required: true,
      placeholder: t('units.namePlaceholder')
    },
    {
      name: 'nameEn',
      label: t('units.nameEn'),
      type: 'text' as const,
      placeholder: t('units.nameEnPlaceholder')
    },
    {
      name: 'symbol',
      label: t('units.symbol'),
      type: 'text' as const,
      required: true,
      placeholder: t('units.symbolPlaceholder')
    },
    {
      name: 'type',
      label: t('units.type'),
      type: 'select' as const,
      required: true,
      options: [
        { value: 'weight', label: t('units.types.weight') },
        { value: 'volume', label: t('units.types.volume') },
        { value: 'piece', label: t('units.types.piece') },
        { value: 'length', label: t('units.types.length') }
      ]
    },
    {
      name: 'conversionRate',
      label: t('units.conversionRate'),
      type: 'number' as const,
      placeholder: '1.0',
      helperText: t('units.conversionRateHelper')
    },
    {
      name: 'baseUnit',
      label: t('units.baseUnit'),
      type: 'select' as const,
      options: units
        .filter(u => !u.baseUnit)
        .map(unit => ({ value: unit.id.toString(), label: `${unit.name} (${unit.symbol})` })),
      helperText: t('units.baseUnitHelper')
    },
    {
      name: 'status',
      label: t('common.status'),
      type: 'select' as const,
      required: true,
      options: [
        { value: 'active', label: t('common.active') },
        { value: 'inactive', label: t('common.inactive') }
      ]
    }
  ];

  // Table columns
  const columns = [
    {
      key: 'name',
      header: t('units.name'),
      sortable: true,
      filterable: true
    },
    {
      key: 'symbol',
      header: t('units.symbol'),
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    {
      key: 'type',
      header: t('units.type'),
      sortable: true,
      filterable: true,
      render: (value: string) => {
        const typeColors = {
          weight: 'bg-blue-100 text-blue-800',
          volume: 'bg-green-100 text-green-800',
          piece: 'bg-purple-100 text-purple-800',
          length: 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge className={typeColors[value as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
            {t(`units.types.${value}`)}
          </Badge>
        );
      }
    },
    {
      key: 'conversionRate',
      header: t('units.conversionRate'),
      sortable: true,
      render: (value: number) => value?.toFixed(2) || '1.00'
    },
    {
      key: 'baseUnit',
      header: t('units.baseUnit'),
      render: (value: number, row: Unit) => {
        if (!value) return <span className="text-gray-500">{t('units.baseUnitSelf')}</span>;
        const baseUnit = units.find(u => u.id === value);
        return baseUnit ? `${baseUnit.name} (${baseUnit.symbol})` : '-';
      }
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {t(`common.${value}`)}
        </Badge>
      )
    }
  ];

  // Export columns
  const exportColumns: ExportColumn<Unit>[] = [
    { key: 'name', header: 'Name' },
    { key: 'nameEn', header: 'English Name' },
    { key: 'symbol', header: 'Symbol' },
    { key: 'type', header: 'Type' },
    { key: 'conversionRate', header: 'Conversion Rate', render: (value) => value?.toFixed(2) || '1.00' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created At', render: (value) => new Date(value).toLocaleDateString() }
  ];

  const exporter = createExporter(exportColumns, { filename: 'units' });

  // Card renderer for mobile view
  const renderCard = (unit: Unit) => (
    <Card key={unit.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{unit.name}</h3>
            <p className="text-sm text-gray-600">{unit.nameEn}</p>
          </div>
          <Badge variant="outline" className="font-mono">
            {unit.symbol}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('units.type')}:</span>
            <div className="mt-1">
              <Badge className={`text-xs ${
                unit.type === 'weight' ? 'bg-blue-100 text-blue-800' :
                unit.type === 'volume' ? 'bg-green-100 text-green-800' :
                unit.type === 'piece' ? 'bg-purple-100 text-purple-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {t(`units.types.${unit.type}`)}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">{t('common.status')}:</span>
            <div className="mt-1">
              <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                {t(`common.${unit.status}`)}
              </Badge>
            </div>
          </div>

          <div>
            <span className="text-gray-500">{t('units.conversionRate')}:</span>
            <div className="mt-1 font-mono">{unit.conversionRate?.toFixed(2) || '1.00'}</div>
          </div>

          <div>
            <span className="text-gray-500">{t('units.baseUnit')}:</span>
            <div className="mt-1">
              {unit.baseUnit ? 
                (() => {
                  const baseUnit = units.find(u => u.id === unit.baseUnit);
                  return baseUnit ? `${baseUnit.name} (${baseUnit.symbol})` : '-';
                })() : 
                <span className="text-gray-500">{t('units.baseUnitSelf')}</span>
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Event handlers
  const handleAdd = () => {
    setEditingUnit(null);
    setShowAddModal(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowEditModal(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      const unitData: NewUnit = {
        name: formData.name,
        nameEn: formData.nameEn || null,
        symbol: formData.symbol,
        type: formData.type,
        conversionRate: formData.conversionRate ? parseFloat(formData.conversionRate) : 1.0,
        baseUnit: formData.baseUnit ? parseInt(formData.baseUnit) : null,
        status: formData.status || 'active'
      };

      let success = false;
      if (editingUnit) {
        success = await updateItem(editingUnit.id, unitData);
      } else {
        success = await createItem(unitData);
      }

      if (success) {
        setShowAddModal(false);
        setShowEditModal(false);
        setEditingUnit(null);
      }
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Error saving unit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('units.deleteConfirm'))) {
      await deleteItem(id);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (window.confirm(t('units.bulkDeleteConfirm', { count: ids.length }))) {
      await bulkDelete(ids);
    }
  };

  const handleBulkStatusToggle = async (ids: number[], newStatus: string) => {
    try {
      const updatePromises = ids.map(id => 
        updateItem(id, { status: newStatus })
      );
      await Promise.all(updatePromises);
      toast.success(t('units.bulkStatusUpdated', { count: ids.length }));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const bulkActions = [
    {
      label: t('common.delete'),
      action: handleBulkDelete,
      variant: 'destructive' as const,
      icon: 'Trash'
    },
    {
      label: t('common.activate'),
      action: (ids: number[]) => handleBulkStatusToggle(ids, 'active'),
      variant: 'default' as const,
      icon: 'CheckCircle'
    },
    {
      label: t('common.deactivate'),
      action: (ids: number[]) => handleBulkStatusToggle(ids, 'inactive'),
      variant: 'secondary' as const,
      icon: 'XCircle'
    }
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {t('navigation.units')}
          </h1>
          <p className="text-gray-600">{t('units.description')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => exporter.print(units, { title: t('units.reportTitle') })}
            className="border-gray-300"
          >
            <Printer className="w-4 h-4 mr-2" />
            {t('common.print')}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => exporter.toCSV(units)}
            className="border-gray-300"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('common.export')}
          </Button>
          
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('units.addUnit')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Scale className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('units.totalUnits')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('units.activeUnits')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('units.unitTypes')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unitTypes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('units.baseUnits')}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.baseUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <AdvancedDataTable
        data={units}
        columns={columns}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={refresh}
        bulkActions={bulkActions}
        renderCard={renderCard}
        searchPlaceholder={t('units.searchPlaceholder')}
        emptyStateTitle={t('units.noUnits')}
        emptyStateDescription={t('units.noUnitsDescription')}
        emptyStateAction={{
          label: t('units.addFirstUnit'),
          onClick: handleAdd
        }}
      />

      {/* Add Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmit}
        title={t('units.addUnit')}
        fields={unitFormFields}
      />

      {/* Edit Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmit}
        title={t('units.editUnit')}
        fields={unitFormFields}
        initialData={editingUnit || undefined}
      />
    </div>
  );
}