import React from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  NavigationMenu as NavigationMenuBase,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

export default function NavigationMenu() {
  const { t } = useTranslation();

  return (
    <NavigationMenuBase className="px-2 font-mono text-muted-foreground">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleHomePage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/second-page">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("titleSecondPage")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/dashboard">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.dashboard")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/pos">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.pos")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/products">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.products")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/categories">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.categories")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/units">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.units")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/users">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.users")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/orders">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.orders")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/reports">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.reports")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/settings">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("navigation.settings")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenuBase>
  );
}
