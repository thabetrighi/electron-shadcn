import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('reports.title')}</h1>
          <p className="text-muted-foreground">
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {t('filters.dateRange')}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              {t('reports.salesReport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('reports.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              {t('reports.inventoryReport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('reports.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              {t('reports.customerReport')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('reports.comingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.dashboard')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('reports.advancedReportsComingSoon')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('reports.description')}
            </p>
            <Link to="/dashboard">
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                {t('reports.viewDashboard')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 