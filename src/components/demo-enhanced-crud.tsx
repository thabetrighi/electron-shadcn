import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CrudPageTemplate } from "./CrudPageTemplate";
import { Column, Stats, FilterField } from "./AdvancedDataTable";
import {
  FormField,
  createTextField,
  createNumberField,
  createSelectField,
  createCurrencyField,
  createEmailField,
} from "./FormModal";
import { Package, Users, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

// =============================================
// DEMO: Enhanced CRUD System Usage Examples
// =============================================

// 1. PRODUCTS PAGE EXAMPLE
export function EnhancedProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enhanced columns with modern features
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      searchable: true,
      exportable: true,
      sticky: true,
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
      type: "currency",
      align: "right",
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (value) => (
        <span
          className={`font-medium ${value <= 0 ? "text-red-600" : value <= 10 ? "text-yellow-600" : "text-green-600"}`}
        >
          {value}
        </span>
      ),
      type: "number",
    },
    {
      key: "status",
      header: "Status",
      render: (status) => (
        <span
          className={`rounded px-2 py-1 text-xs ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      ),
      filterable: true,
    },
  ];

  // Enhanced form fields with validation
  const formFields: FormField[] = [
    createTextField("name", "Product Name", {
      validation: { required: true, minLength: 2 },
      placeholder: "Enter product name",
    }),
    createCurrencyField("price", "Price", {
      validation: { required: true, positive: true },
    }),
    createNumberField("stock", "Stock", {
      validation: { required: true, min: 0, integer: true },
    }),
    createSelectField("status", "Status", [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ]),
  ];

  // Advanced filter fields
  const filterFields: FilterField[] = [
    {
      key: "status",
      label: "Status",
      type: "multiselect",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      key: "price",
      label: "Price Range",
      type: "range",
      validation: { min: 0 },
    },
  ];

  // Enhanced statistics
  const stats: Stats[] = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-600",
      format: "number",
    },
    {
      label: "Total Value",
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      icon: DollarSign,
      color: "text-green-600",
      format: "currency",
    },
  ];

  return (
    <CrudPageTemplate
      // Core data
      data={products}
      loading={loading}
      // Entity configuration
      entityName="product"
      entityNamePlural="products"
      entityConfig={{
        icon: Package,
        color: "text-blue-600",
        description: "Manage your product inventory",
      }}
      // Table configuration
      columns={columns}
      filterFields={filterFields}
      stats={stats}
      // Modern features enabled
      searchable={true}
      filterable={true}
      sortable={true}
      paginated={true}
      selectable={true}
      exportable={true}
      // View modes
      viewModes={["table", "cards"]}
      defaultViewMode="table"
      // Form configuration
      formFields={formFields}
      formSections={[
        {
          title: "Basic Information",
          fields: ["name", "status"],
        },
        {
          title: "Pricing & Inventory",
          fields: ["price", "stock"],
        },
      ]}
      // CRUD operations
      onAdd={async (data) => {
        // API call to create product
        console.log("Creating product:", data);
        toast.success("Product created successfully");
        return data;
      }}
      onEdit={async (id, data) => {
        // API call to update product
        console.log("Updating product:", id, data);
        toast.success("Product updated successfully");
        return data;
      }}
      onDelete={async (id) => {
        // API call to delete product
        console.log("Deleting product:", id);
        toast.success("Product deleted successfully");
      }}
      onBulkDelete={async (ids) => {
        // API call to delete multiple products
        console.log("Bulk deleting products:", ids);
        toast.success(`${ids.length} products deleted successfully`);
      }}
      onExport={async (format, data, columns) => {
        // Custom export logic
        console.log("Exporting data:", format, data.length, "items");
        toast.success("Export completed successfully");
      }}
      onRefresh={async () => {
        setLoading(true);
        // API call to refresh data
        setTimeout(() => setLoading(false), 1000);
      }}
      // Advanced features
      enableAnalytics={true}
      autoRefresh={true}
      refreshInterval={60000}
      density="comfortable"
    />
  );
}

// 2. USERS PAGE EXAMPLE
export function EnhancedUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);

  const columns: Column<any>[] = [
    { key: "name", header: "Name", sortable: true, searchable: true },
    { key: "email", header: "Email", sortable: true, searchable: true },
    { key: "role", header: "Role", filterable: true },
    { key: "status", header: "Status", filterable: true },
  ];

  const formFields: FormField[] = [
    createTextField("name", "Full Name", { validation: { required: true } }),
    createEmailField("email", "Email", { validation: { required: true } }),
    createSelectField("role", "Role", [
      { value: "admin", label: "Administrator" },
      { value: "user", label: "User" },
    ]),
  ];

  return (
    <CrudPageTemplate
      data={users}
      entityName="user"
      entityNamePlural="users"
      entityConfig={{
        icon: Users,
        color: "text-green-600",
      }}
      columns={columns}
      formFields={formFields}
      onAdd={async (data) => data}
      onEdit={async (id, data) => data}
      onDelete={async (id) => {}}
      title="Users"
      subtitle="Manage system users"
    />
  );
}

// =============================================
// QUICK SETUP GUIDE FOR ANY ENTITY
// =============================================

/*
1. Define your entity interface:
   interface Product {
     id: number;
     name: string;
     price: number;
     // ... other fields
   }

2. Configure columns:
   const columns: Column<Product>[] = [
     {
       key: 'name',
       header: 'Product Name',
       sortable: true,
       searchable: true,
       exportable: true
     },
     // ... more columns
   ];

3. Configure form fields:
   const formFields: FormField[] = [
     createTextField('name', 'Product Name', {
       validation: { required: true }
     }),
     // ... more fields
   ];

4. Set up filter fields (optional):
   const filterFields: FilterField[] = [
     {
       key: 'status',
       label: 'Status',
       type: 'select',
       options: [...]
     }
   ];

5. Define statistics (optional):
   const stats: Stats[] = [
     {
       label: 'Total Items',
       value: data.length,
       icon: Package,
       format: 'number'
     }
   ];

6. Implement CRUD operations:
   const handleAdd = async (formData) => {
     // API call to create
     const response = await window.api.database.create('products', formData);
     return response;
   };

7. Use the CrudPageTemplate:
   <CrudPageTemplate
     data={data}
     loading={loading}
     entityName="product"
     entityNamePlural="products"
     columns={columns}
     formFields={formFields}
     onAdd={handleAdd}
     onEdit={handleEdit}
     onDelete={handleDelete}
     // ... other props
   />

FEATURES AVAILABLE:
✅ Advanced pagination with customizable page sizes
✅ Multi-column sorting
✅ Global and column-specific search
✅ Advanced filtering (text, select, multiselect, range, daterange)
✅ Bulk actions (delete, edit, export, custom)
✅ Export to CSV, Excel, PDF, JSON, Print
✅ Real-time statistics with trends
✅ Multiple view modes (table, cards, list)
✅ Responsive design
✅ Multi-language support
✅ Form validation with custom rules
✅ Auto-refresh capabilities
✅ Column visibility control
✅ Row selection and bulk operations
✅ Empty states and error handling
✅ Loading states and animations
✅ Toast notifications
✅ Confirmation dialogs
✅ Custom actions and toolbar
✅ Analytics dashboard (optional)
✅ Audit logging (optional)
✅ Keyboard shortcuts
✅ Drag and drop (optional)
✅ Inline editing (optional)

USAGE IN PAGES:
- ProductsPage: Full inventory management
- UsersPage: User administration
- CategoriesPage: Category organization
- UnitsPage: Unit management
- OrdersPage: Order processing
- Any custom entity: Just configure and use!
*/
