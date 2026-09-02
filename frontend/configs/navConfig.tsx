import type * as Icon from "lucide-react";

type IconName = keyof typeof Icon;

export type MenuLeafSubItem = {
  label: string;
  href: string;
  activePath?: string;
  badge?: string;
  badgeClassName?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
};

export type MenuGroupSubItem = {
  label: string;
  childItems: MenuLeafSubItem[];
};

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem;

export type MenuItem = {
  icon: IconName;
  label: string;
} & (
  | {
      href: string;
      badge?: string;
      badgeClassName?: string;
      childItems?: never;
      target?: "_blank" | "_self" | "_parent" | "_top";
    }
  | {
      href?: never;
      badge?: string;
      badgeClassName?: string;
      childItems: MenuSubItem[];
    }
);

export type NavItem = {
  groupLabel?: string;
  items: MenuItem[];
};

export const navItems: NavItem[] = [
  {
    groupLabel: "Main",
    items: [
      {
        icon: "LayoutDashboard",
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        icon: "Users",
        label: "Groups",
        href: "/groups",
      },
      {
        icon: "ReceiptText",
        label: "Expenses",
        href: "/expenses",
      },
      {
        icon: "Wallet",
        label: "Balances",
        href: "/balances",
      },
      {
        icon: "Activity",
        label: "Activity",
        href: "/activity",
      },
    ],
  },
  {
    groupLabel: "Account",
    items: [
      {
        icon: "User",
        label: "Profile",
        href: "/profile",
      },
      {
        icon: "Settings",
        label: "Settings",
        href: "/settings",
      },
    ],
  },
];
