import { MemberAction } from "./rbac.actions.js";
import { GroupRole } from "./rbac.role.js";

export const RBAC_PERIMISSION:Record<MemberAction,Record<GroupRole,GroupRole[]>>={
 create:{
    ADMIN:[GroupRole.ADMIN],
    MEMBER:[]
 },
 read:{
    ADMIN:[GroupRole.ADMIN,GroupRole.MEMBER],
    MEMBER:[GroupRole.MEMBER]
 },
 update:{
    ADMIN:[GroupRole.ADMIN],
    MEMBER:[]
 },
 delete:{
    ADMIN:[GroupRole.ADMIN],
    MEMBER:[]
 }
}

export function canRead(
  currentUser: { id: string; role: GroupRole },
  targetUser: { id: string; role: GroupRole }
): boolean {
  const allowedRoles = RBAC_PERIMISSION.read[currentUser.role];

  // Role check
  if (!allowedRoles.includes(targetUser.role)) {
    return false;
  }

  if (currentUser.role === GroupRole.MEMBER) {
    return currentUser.id === targetUser.id;
  }

  return true;
}