import { eq, and, gte, lte, sum, count, sql } from "drizzle-orm";
import { db } from "../connection";
import {
  orders,
  orderItems,
  products,
  users,
  type Order,
  type OrderItem,
} from "../schema";
import { useTranslation } from "react-i18next";

export interface SupplierPaymentReport {
  supplierId: number;
  supplierName: string;
  totalOrdersAmount: number;
  totalWeights: number;
  transactionPrice: number;
  laborCost: number;
  taxValue: number;
  totalExpenses: number;
  paymentAmount: number;
  orderCount: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  supplierId?: number;
  transactionPrice?: number;
  laborCost?: number;
  taxValue?: number;
}

export class ReportsService {
  /**
   * Generate supplier payment report
   * Payment Amount = Total Orders Amount - Total Expenses
   * Total Expenses = (Total Weights * Transaction Price) + Labor Cost + Tax Value
   */
  static async getSupplierPaymentReport(
    filters: ReportFilters = {},
  ): Promise<{
    success: boolean;
    data?: SupplierPaymentReport[];
    error?: string;
  }> {
    const { t } = useTranslation();
    try {
      const {
        dateFrom,
        dateTo,
        supplierId,
        transactionPrice = 0,
        laborCost = 0,
        taxValue = 0,
      } = filters;

      // Build date filter conditions
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, dateFrom));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, dateTo));
      }

      // If no date range provided, default to today
      if (dateConditions.length === 0) {
        const today = new Date().toISOString().split("T")[0];
        dateConditions.push(eq(orders.orderDate, today));
      }

      // Build supplier filter
      const supplierConditions = [];
      if (supplierId) {
        supplierConditions.push(eq(products.supplierId, supplierId));
      }

      // Get orders with items and products for the date range
      const ordersWithItems = await db
        .select({
          orderId: orders.id,
          orderDate: orders.orderDate,
          totalAmount: orders.totalAmount,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          supplierId: products.supplierId,
          supplierName: users.name,
          productWeight: products.weight,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .leftJoin(users, eq(products.supplierId, users.id))
        .where(and(...dateConditions, ...supplierConditions));

      // Debug: Log the query conditions
      console.log("🔍 Query conditions:", {
        dateConditions: dateConditions.length,
        supplierConditions: supplierConditions.length,
        dateFrom,
        dateTo,
        supplierId,
      });

      // Debug: Log the SQL query being executed
      console.log("🔍 SQL Query would be:", {
        from: "orders",
        joins: ["orderItems", "products", "users"],
        where: {
          dateConditions,
          supplierConditions,
        },
      });

      // Debug: Check if we have any data at all
      if (ordersWithItems.length === 0) {
        console.log("⚠️ No orders with items found for the given criteria");
        console.log("🔍 This could mean:");
        console.log("  - No orders exist for the date range");
        console.log("  - No order items exist");
        console.log("  - No products are linked to suppliers");
        console.log("  - Date range is incorrect");
      }

      // Group by supplier and calculate totals
      const supplierGroups = new Map<
        number,
        {
          supplierId: number;
          supplierName: string;
          orders: Set<number>;
          totalAmount: number;
          totalWeights: number;
          orderCount: number;
        }
      >();

      // Debug: Log the raw data
      console.log("🔍 Raw orders with items:", ordersWithItems);
      console.log("🔍 Sample item structure:", ordersWithItems[0]);
      console.log(
        "🔍 Quantities found:",
        ordersWithItems.map((item) => ({
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          supplierName: item.supplierName,
        })),
      );
      console.log("🔍 Total items found:", ordersWithItems.length);
      console.log(
        "🔍 Items with quantity > 0:",
        ordersWithItems.filter((item) => (item.quantity || 0) > 0).length,
      );

      // Debug: Check for null/undefined quantities
      const nullQuantities = ordersWithItems.filter(
        (item) => item.quantity === null || item.quantity === undefined,
      );
      if (nullQuantities.length > 0) {
        console.log(
          "⚠️ Found items with null/undefined quantities:",
          nullQuantities.length,
        );
        console.log(
          "🔍 Sample null quantity items:",
          nullQuantities.slice(0, 3),
        );
      }

      for (const item of ordersWithItems) {
        const supplierId = item.supplierId || 0;
        const supplierName =
          item.supplierName || t("reportsSection.unknownSupplier");

        if (!supplierGroups.has(supplierId)) {
          supplierGroups.set(supplierId, {
            supplierId,
            supplierName,
            orders: new Set(),
            totalAmount: 0,
            totalWeights: 0,
            orderCount: 0,
          });
        }

        const group = supplierGroups.get(supplierId)!;
        group.orders.add(item.orderId);
        group.totalAmount += item.totalPrice || 0;

        // Calculate total quantities (weights): sum of quantities only
        const quantity = item.quantity || 0;
        group.totalWeights += quantity;

        // Debug: Log the running total for this supplier
        console.log(
          `📊 Running total for ${supplierName}: ${group.totalWeights} (added ${quantity})`,
        );

        // Debug: Log each item's quantity
        console.log(
          `📦 Item quantity for supplier ${supplierName}: ${quantity} (raw: ${item.quantity})`,
        );
        console.log(
          `📦 Item details: Order ${item.orderId}, Product ${item.productId}, Quantity ${item.quantity}, Price ${item.totalPrice}`,
        );

        // Additional debug for zero quantities
        if (quantity === 0) {
          console.log(
            `⚠️ Zero quantity found for Order ${item.orderId}, Product ${item.productId}`,
          );
          console.log(
            `🔍 This item has: quantity=${item.quantity}, totalPrice=${item.totalPrice}`,
          );
        }
      }

      // Debug: Log supplier groups
      console.log("🏪 Supplier groups:", Array.from(supplierGroups.entries()));

      // Convert to final report format
      const reports: SupplierPaymentReport[] = [];
      for (const [supplierId, group] of supplierGroups) {
        const orderCount = group.orders.size;
        const totalExpenses =
          group.totalWeights * transactionPrice + laborCost + taxValue;
        const paymentAmount = group.totalAmount - totalExpenses;

        // Debug: Log final calculations
        console.log(`💰 Final calculations for ${group.supplierName}:`);
        console.log(`  - Total Weights (quantities): ${group.totalWeights}`);
        console.log(`  - Total Amount: ${group.totalAmount}`);
        console.log(`  - Transaction Price: ${transactionPrice}`);
        console.log(`  - Total Expenses: ${totalExpenses}`);
        console.log(`  - Payment Amount: ${paymentAmount}`);
        console.log(`  - Order Count: ${orderCount}`);
        console.log(`  - Orders: ${Array.from(group.orders)}`);

        // Additional debug for zero total weights
        if (group.totalWeights === 0) {
          console.log(
            `⚠️ Zero total weights for supplier ${group.supplierName}`,
          );
          console.log(
            `🔍 This supplier has ${group.orders.size} orders but zero total quantities`,
          );
        }

        reports.push({
          supplierId,
          supplierName: group.supplierName,
          totalOrdersAmount: group.totalAmount,
          totalWeights: group.totalWeights,
          transactionPrice,
          laborCost,
          taxValue,
          totalExpenses,
          paymentAmount,
          orderCount,
          dateRange: {
            from: dateFrom || new Date().toISOString().split("T")[0],
            to: dateTo || new Date().toISOString().split("T")[0],
          },
        });
      }

      // Debug: Log final reports
      console.log("📊 Final reports:", reports);
      console.log(
        "📊 Reports with zero quantities:",
        reports.filter((r) => r.totalWeights === 0).length,
      );
      console.log(
        "📊 Reports with non-zero quantities:",
        reports.filter((r) => r.totalWeights > 0).length,
      );

      // If no data found, return empty array
      if (reports.length === 0) {
        console.log("⚠️ No reports generated - no data found");
        return { success: true, data: [] };
      }

      // Check if all reports have zero quantities
      const allZeroQuantities = reports.every((r) => r.totalWeights === 0);
      if (allZeroQuantities) {
        console.log(
          "⚠️ All reports have zero quantities - this might indicate a data issue",
        );
        console.log("🔍 Possible causes:");
        console.log("  - All order items have quantity = 0");
        console.log("  - All order items have quantity = null");
        console.log("  - Database schema issue");
        console.log("  - Data insertion issue");
      }

      console.log("✅ Reports generated successfully");
      return { success: true, data: reports };
    } catch (error: any) {
      console.error("❌ Error in getSupplierPaymentReport:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get daily sales summary
   */
  static async getDailySalesSummary(
    date: string = new Date().toISOString().split("T")[0],
  ) {
    try {
      const result = await db
        .select({
          totalSales: sum(orders.totalAmount),
          orderCount: count(orders.id),
          averageOrderValue: sql<number>`AVG(${orders.totalAmount})`,
        })
        .from(orders)
        .where(eq(orders.orderDate, date));

      // If no data found, return null
      if (!result[0]?.totalSales) {
        return {
          success: true,
          data: null,
        };
      }

      // Ensure proper type conversion
      const data = result[0];
      return {
        success: true,
        data: {
          totalSales:
            typeof data.totalSales === "string"
              ? parseFloat(data.totalSales)
              : data.totalSales,
          orderCount: data.orderCount,
          averageOrderValue:
            typeof data.averageOrderValue === "string"
              ? parseFloat(data.averageOrderValue)
              : data.averageOrderValue,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sales summary for date range
   */
  static async getSalesSummary(dateFrom: string, dateTo: string) {
    try {
      const result = await db
        .select({
          totalSales: sum(orders.totalAmount),
          orderCount: count(orders.id),
          averageOrderValue: sql<number>`AVG(${orders.totalAmount})`,
        })
        .from(orders)
        .where(
          and(gte(orders.orderDate, dateFrom), lte(orders.orderDate, dateTo)),
        );

      // If no data found, return null
      if (!result[0]?.totalSales) {
        return {
          success: true,
          data: null,
        };
      }

      // Ensure proper type conversion
      const data = result[0];
      return {
        success: true,
        data: {
          totalSales:
            typeof data.totalSales === "string"
              ? parseFloat(data.totalSales)
              : data.totalSales,
          orderCount: data.orderCount,
          averageOrderValue:
            typeof data.averageOrderValue === "string"
              ? parseFloat(data.averageOrderValue)
              : data.averageOrderValue,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get top selling products
   */
  static async getTopSellingProducts(
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string,
  ) {
    try {
      const dateConditions = [];
      if (dateFrom) {
        dateConditions.push(gte(orders.orderDate, dateFrom));
      }
      if (dateTo) {
        dateConditions.push(lte(orders.orderDate, dateTo));
      }

      const result = await db
        .select({
          productId: orderItems.productId,
          productName: orderItems.productName,
          totalQuantity: sum(orderItems.quantity),
          totalRevenue: sum(orderItems.totalPrice),
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
        .groupBy(orderItems.productId)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(limit);

      // If no data found, return empty array
      if (result.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Ensure proper type conversion
      const convertedData = result.map((item) => ({
        productId: item.productId || 0,
        productName: item.productName,
        totalQuantity:
          typeof item.totalQuantity === "string"
            ? parseInt(item.totalQuantity)
            : item.totalQuantity || 0,
        totalRevenue:
          typeof item.totalRevenue === "string"
            ? parseFloat(item.totalRevenue)
            : item.totalRevenue || 0,
      }));

      return { success: true, data: convertedData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get suppliers list for filtering
   */
  static async getSuppliers() {
    try {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        })
        .from(users)
        .where(eq(users.role, "supplier"));

      // If no suppliers found, return empty array
      if (result.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get products count
   */
  static async getProductsCount() {
    try {
      const result = await db
        .select({
          count: count(products.id),
        })
        .from(products);

      return {
        success: true,
        data: result[0]?.count || 0,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
