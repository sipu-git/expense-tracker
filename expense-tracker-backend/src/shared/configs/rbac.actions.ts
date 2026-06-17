export const RBAC_ACTIONS = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    READ: "read"
}
export type MemberAction = (typeof RBAC_ACTIONS)[keyof typeof RBAC_ACTIONS]