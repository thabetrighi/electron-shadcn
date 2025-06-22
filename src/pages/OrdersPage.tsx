import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingCart, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders
          </p>
        </div>
        <Link to="/pos">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Orders Management Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              This page will show all orders, order history, and order management features.
            </p>
            <Link to="/pos">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Order
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 