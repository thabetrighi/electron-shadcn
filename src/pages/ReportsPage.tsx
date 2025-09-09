import React from 'react';
import SupplierPaymentReport from '../components/reports/SupplierPaymentReport';

export default function ReportsPage() {

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تقارير الموردين</h1>
          <p className="text-muted-foreground">
            إدارة وطباعة تقارير دفعات الموردين
          </p>
        </div>
      </div>

      {/* Report Content */}
      <SupplierPaymentReport />
    </div>
  );
} 