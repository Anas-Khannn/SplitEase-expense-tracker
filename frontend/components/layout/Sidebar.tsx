"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icon from "lucide-react";
import type { MenuItem, NavItem } from "@/configs/navConfig";
import { navItems } from "@/configs/navConfig";
import themeConfig from "@/configs/themeConfig";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function isLinkActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

const SidebarMenuItemComponent = ({
  item,
  pathname,
}: {
  item: MenuItem;
  pathname: string;
}) => {
  const Tag = item.icon ? (Icon[item.icon] as ComponentType) : null;
  const isActive = item.href ? isLinkActive(item.href, pathname) : false;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.label}
        render={<Link href={item.href ?? "/dashboard"} />}
        isActive={isActive}
        className="data-[active=true]:bg-brand/10! data-[active=true]:text-brand!"
      >
        {Tag && <Tag />}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarLayout = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="gap-2.5 bg-transparent!"
              render={<Link href={themeConfig.homePageUrl} />}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
                SE
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold text-nowrap">
                  {themeConfig.templateName}
                </span>
                <span className="text-xs font-light text-nowrap">
                  Expense Tracker
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:overflow-y-auto">
        {navItems.map((navItem: NavItem, index) => (
          <SidebarGroup key={navItem.groupLabel || index}>
            {navItem.groupLabel && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 tracking-wider uppercase">
                {navItem.groupLabel}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {navItem.items.map((item) => (
                  <SidebarMenuItemComponent
                    key={item.label}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default SidebarLayout;
