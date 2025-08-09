# تقارير النظام - System Reports

## نظرة عامة - Overview

تم تحسين صفحة التقارير لتشمل تقارير متقدمة ومفصلة مع إمكانية التصفية والحفظ.

The reports page has been enhanced to include advanced and detailed reports with filtering and saving capabilities.

## التقارير المتاحة - Available Reports

### 1. تقرير الدفع للمورد - Supplier Payment Report

#### الوصف - Description
تقرير يحسب مدفوعات الموردين بناءً على الطلبات والأوزان والمصروفات.

A report that calculates supplier payments based on orders, weights, and expenses.

#### الصيغة - Formula
```
مبلغ الدفع للمورد = مجموع الاجمالي للطلبات - مجموع المصاريف
Payment Amount = Total Orders Amount - Total Expenses

مجموع المصاريف = (مجموع الأوزان * سعر المعاملة) + أجرة العمال + قيمة المكس
Total Expenses = (Total Weights * Transaction Price) + Labor Cost + Tax Value
```

#### الميزات - Features
- تحديد نطاق التاريخ (افتراضي: اليوم الحالي)
- تصفية حسب المورد
- إدخال سعر المعاملة يدوياً
- إدخال أجرة العمال يدوياً
- إدخال قيمة المكس يدوياً
- عرض إحصائيات مفصلة
- إمكانية حفظ التقرير

### 2. تقرير المبيعات - Sales Report

#### الوصف - Description
تقرير يعرض إحصائيات المبيعات وأفضل المنتجات أداءً.

A report that displays sales statistics and top performing products.

#### الميزات - Features
- ملخص مبيعات اليوم
- ملخص مبيعات نطاق التاريخ
- متوسط قيمة الطلب
- أفضل المنتجات مبيعاً
- إحصائيات مفصلة

### 3. تقرير المخزون - Inventory Report (قريباً - Coming Soon)

#### الوصف - Description
تقرير لتتبع مستويات المخزون وحركة المخزون وأداء المنتجات.

A report to track inventory levels, stock movements, and product performance.

## كيفية الاستخدام - How to Use

### تقرير الدفع للمورد - Supplier Payment Report

1. **اختر نطاق التاريخ** - Select Date Range
   - التاريخ من - Date From
   - التاريخ إلى - Date To
   - افتراضي: اليوم الحالي - Default: Today

2. **اختر المورد** - Select Supplier
   - جميع الموردين - All Suppliers
   - أو اختر مورد محدد - Or select specific supplier

3. **أدخل القيم المطلوبة** - Enter Required Values
   - سعر المعاملة - Transaction Price
   - أجرة العمال - Labor Cost
   - قيمة المكس - Tax Value

4. **انقر على "إنشاء التقرير"** - Click "Generate Report"

5. **عرض النتائج** - View Results
   - إحصائيات ملخصة - Summary Statistics
   - تفاصيل كل مورد - Details for each supplier
   - مبلغ الدفع المحسوب - Calculated payment amount

### تقرير المبيعات - Sales Report

1. **اختر نطاق التاريخ** - Select Date Range
2. **انقر على "إنشاء التقرير"** - Click "Generate Report"
3. **عرض النتائج** - View Results
   - مبيعات اليوم - Today's Sales
   - ملخص نطاق التاريخ - Date Range Summary
   - أفضل المنتجات مبيعاً - Top Selling Products

## الملفات المضافة - Added Files

### Services
- `src/database/services/reports.service.ts` - خدمة التقارير الرئيسية

### Components
- `src/components/reports/SupplierPaymentReport.tsx` - مكون تقرير الدفع للمورد
- `src/components/reports/SalesReport.tsx` - مكون تقرير المبيعات

### Updated Files
- `src/pages/ReportsPage.tsx` - صفحة التقارير الرئيسية
- `src/localization/translations.ts` - الترجمات الجديدة

## الميزات التقنية - Technical Features

### قاعدة البيانات - Database
- استعلامات متقدمة مع JOIN
- تجميع البيانات حسب المورد
- حساب الأوزان والمبالغ تلقائياً

### واجهة المستخدم - User Interface
- تصميم متجاوب - Responsive Design
- تبويبات للتنقل - Tabs for Navigation
- جداول تفاعلية - Interactive Tables
- إحصائيات ملخصة - Summary Statistics

### الترجمة - Localization
- دعم اللغة العربية والإنجليزية
- ترجمات شاملة لجميع العناصر

## التطوير المستقبلي - Future Development

### الميزات المخططة - Planned Features
1. **حفظ التقارير** - Save Reports
   - حفظ إعدادات التقرير
   - إعادة تحميل التقارير المحفوظة

2. **تصدير التقارير** - Export Reports
   - تصدير إلى PDF
   - تصدير إلى Excel
   - طباعة التقارير

3. **رسوم بيانية** - Charts
   - رسوم بيانية تفاعلية
   - مقارنات زمنية

4. **تقرير المخزون** - Inventory Report
   - مستويات المخزون
   - حركة المخزون
   - تنبيهات المخزون المنخفض

### التحسينات - Enhancements
- تحسين الأداء للبيانات الكبيرة
- إضافة المزيد من الفلاتر
- تحسين واجهة المستخدم
- إضافة المزيد من الإحصائيات

## الدعم - Support

للاستفسارات أو المشاكل، يرجى التواصل مع فريق التطوير.

For inquiries or issues, please contact the development team.
