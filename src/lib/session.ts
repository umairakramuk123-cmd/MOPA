import { USERS } from "./data";
import { ROLES } from "./roles";
import type { RoleId, Session } from "./types";

export const SESSION_COOKIE = "mopa_session";

export function buildSession(role: RoleId): Session {
  const safeRole: RoleId = ROLES[role] ? role : "data-manager";
  const user = USERS.find((u) => u.role === safeRole) ?? USERS[0];
  return { user, role: ROLES[safeRole] };
}
