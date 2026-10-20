import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Bell,
  Building2,
  FileBarChart2,
  FolderClosed,
  GitBranch,
  History,
  LayoutDashboard,
  LineChart,
  ScrollText,
  Settings2,
  ShieldCheck,
  UsersRound,
  Landmark,
  LifeBuoy,
  UserRound,
} from "lucide-react";
import type { Permission } from "./types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  badge?: "alerts" | "approvals";
  hint?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hint: "Operational command centre" },
      { label: "Executive", href: "/executive", icon: LineChart, permission: "executive.view", hint: "Consolidated legislative picture" },
    ],
  },
  {
    label: "Legislative",
    items: [
      { label: "Bills Registry", href: "/bills", icon: ScrollText, permission: "bills.view", hint: "All registered bills" },
      { label: "Stage Tracking", href: "/tracking", icon: GitBranch, permission: "bills.view", hint: "Workflow milestones" },
      { label: "Committees", href: "/committees", icon: UsersRound, permission: "bills.view", hint: "Standing Committee clocks" },
      { label: "Documents", href: "/documents", icon: FolderClosed, permission: "documents.view", hint: "Central repository" },
    ],
  },
  {
    label: "Oversight",
    items: [
      { label: "Alerts", href: "/alerts", icon: Bell, permission: "alerts.view", badge: "alerts", hint: "Milestones and exceptions" },
      { label: "Reports", href: "/reports", icon: FileBarChart2, permission: "reports.view", hint: "Fifteen statutory reports" },
      { label: "Ministries", href: "/ministries", icon: Building2, permission: "ministries.view", hint: "Division workload" },
      { label: "Approvals", href: "/approvals", icon: BadgeCheck, permission: "approvals.act", badge: "approvals", hint: "Endorsements awaiting decision" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Users & Roles", href: "/users", icon: ShieldCheck, permission: "users.manage", hint: "Access control" },
      { label: "Audit Trail", href: "/audit", icon: History, permission: "audit.view", hint: "Immutable change log" },
      { label: "Settings", href: "/settings", icon: Settings2, permission: "settings.manage", hint: "Deadlines and alert rules" },
    ],
  },
];

export const UTILITY_NAV: NavItem[] = [
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Help & Glossary", href: "/help", icon: LifeBuoy },
];

export const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  executive: "Executive Dashboard",
  bills: "Bills Registry",
  tracking: "Stage Tracking",
  committees: "Standing Committees",
  documents: "Document Repository",
  alerts: "Alerts & Notifications",
  reports: "Reports",
  ministries: "Ministries & Divisions",
  approvals: "Approvals",
  users: "Users & Roles",
  audit: "Audit Trail",
  settings: "Settings",
  profile: "My Profile",
  help: "Help & Glossary",
};

export const PORTAL_MARK = Landmark;
