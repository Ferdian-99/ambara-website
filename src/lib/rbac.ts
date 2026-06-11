export const roles = ["super_admin", "content_manager", "project_manager", "sales", "client"] as const;

export type UserRole = (typeof roles)[number];

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  content_manager: "Content Manager",
  project_manager: "Project Manager",
  sales: "Sales",
  client: "Client",
};

export type Permission =
  | "dashboard:view"
  | "projects:create"
  | "projects:manage"
  | "projects:view_all"
  | "projects:view_own"
  | "clients:create"
  | "clients:view"
  | "documents:upload"
  | "documents:view"
  | "cms:placeholder";

const permissionsByRole: Record<UserRole, Permission[]> = {
  super_admin: [
    "dashboard:view",
    "projects:create",
    "projects:manage",
    "projects:view_all",
    "projects:view_own",
    "clients:create",
    "clients:view",
    "documents:upload",
    "documents:view",
    "cms:placeholder",
  ],
  project_manager: ["dashboard:view", "projects:create", "projects:manage", "projects:view_all", "documents:upload", "documents:view"],
  sales: ["dashboard:view", "projects:create", "projects:view_all", "clients:create", "clients:view", "documents:view"],
  content_manager: ["dashboard:view", "cms:placeholder"],
  client: ["dashboard:view", "projects:view_own", "documents:view"],
};

export function hasPermission(role: UserRole | null | undefined, permission: Permission) {
  if (!role) return false;
  return permissionsByRole[role].includes(permission);
}

export function canAccessAdmin(role: UserRole | null | undefined) {
  return role !== "client" && Boolean(role);
}

export function canAccessClient(role: UserRole | null | undefined) {
  return role === "client";
}

export function dashboardPathForRole(role: UserRole | null | undefined) {
  return role === "client" ? "/client" : "/admin";
}

export function getDashboardPathForRole(role: UserRole | null | undefined) {
  return dashboardPathForRole(role);
}

export function isUserRole(value: string | null | undefined): value is UserRole {
  return roles.includes(value as UserRole);
}
