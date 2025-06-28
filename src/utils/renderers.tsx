import React from 'react';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Archive, 
  XCircle, 
  Activity, 
  Truck, 
  DollarSign,
  Crown,
  UserCheck,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from './formatters';

// React component renderers
export const renderCurrency = (amount: number | null | undefined, className?: string) => (
  <span className={`font-semibold text-green-600 ${className || ''}`}>
    {formatCurrency(amount)}
  </span>
);

export const renderStock = (stock: number | null | undefined, lowStockThreshold = 10, className?: string) => (
  <div className={`flex items-center space-x-2 ${className || ''}`}>
    <span className={`font-medium ${
      !stock || stock <= 0 ? 'text-red-600' : 
      stock <= lowStockThreshold ? 'text-yellow-600' : 
      'text-green-600'
    }`}>
      {formatNumber(stock)}
    </span>
    {(!stock || stock <= 0) && <Badge variant="destructive" className="text-xs">Out</Badge>}
    {stock && stock > 0 && stock <= lowStockThreshold && <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">Low</Badge>}
  </div>
);

export const renderStatus = (status: string) => {
  if (!status) return <span className="text-gray-400">-</span>;
  
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    inactive: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock },
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    archived: { color: 'bg-red-100 text-red-800 border-red-200', icon: Archive },
    deleted: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
    processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Activity },
    shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
    failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    refunded: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Activity }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const renderUserRole = (role: string) => {
  if (!role) return <span className="text-gray-400">-</span>;
  
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown },
    client: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck },
    supplier: { color: 'bg-green-100 text-green-800 border-green-200', icon: Building }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.client;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border`}>
      <Icon className="w-3 h-3 mr-1" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

export const renderDate = (date: string | Date | null | undefined) => {
  if (!date) return <span className="text-gray-400">-</span>;
  return (
    <span className="text-gray-900">
      {formatDate(date)}
    </span>
  );
};

export const renderDateTime = (date: string | Date | null | undefined) => {
  if (!date) return <span className="text-gray-400">-</span>;
  return (
    <span className="text-gray-900">
      {formatDateTime(date)}
    </span>
  );
};

export const renderPhone = (phone: string) => {
  if (!phone) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex items-center">
      <Phone className="w-3 h-3 mr-1 text-gray-400" />
      <span className="font-mono text-sm">{phone}</span>
    </div>
  );
};

export const renderEmail = (email: string) => {
  if (!email) return <span className="text-gray-400">-</span>;
  return (
    <div className="flex items-center">
      <Mail className="w-3 h-3 mr-1 text-gray-400" />
      <span className="text-sm">{email}</span>
    </div>
  );
}; 