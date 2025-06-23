import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import HomePage from "../pages/HomePage";
import SecondPage from "@/pages/SecondPage";
import DashboardPage from "@/pages/DashboardPage";
import POSPage from "@/pages/POSPage";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import UsersPage from "@/pages/UsersPage";
import OrdersPage from "@/pages/OrdersPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import UnitsPage from "@/pages/UnitsPage";

// TODO: Steps to add a new route:
// 1. Create a new page component in the '../pages/' directory (e.g., NewPage.tsx)
// 2. Import the new page component at the top of this file
// 3. Define a new route for the page using createRoute()
// 4. Add the new route to the routeTree in RootRoute.addChildren([...])
// 5. Add a new Link in the navigation section of RootRoute if needed

// Example of adding a new route:
// 1. Create '../pages/NewPage.tsx'
// 2. Import: import NewPage from '../pages/NewPage';
// 3. Define route:
//    const NewRoute = createRoute({
//      getParentRoute: () => RootRoute,
//      path: '/new',
//      component: NewPage,
//    });
// 4. Add to routeTree: RootRoute.addChildren([HomeRoute, NewRoute, ...])
// 5. Add Link: <Link to="/new">New Page</Link>

export const HomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: HomePage,
});

export const SecondPageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/second-page",
  component: SecondPage,
});

export const DashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

export const POSRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/pos",
  component: POSPage,
});

export const ProductsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/products",
  component: ProductsPage,
});

export const CategoriesRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/categories",
  component: CategoriesPage,
});

export const UsersRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/users",
  component: UsersPage,
});

export const OrdersRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/orders",
  component: OrdersPage,
});

export const ReportsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/reports",
  component: ReportsPage,
});

export const SettingsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/settings",
  component: SettingsPage,
});

export const UnitsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/units",
  component: UnitsPage,
});

export const rootTree = RootRoute.addChildren([
  HomeRoute, 
  SecondPageRoute, 
  DashboardRoute, 
  POSRoute, 
  ProductsRoute, 
  CategoriesRoute, 
  UnitsRoute,
  UsersRoute,
  OrdersRoute,
  ReportsRoute,
  SettingsRoute
]);
