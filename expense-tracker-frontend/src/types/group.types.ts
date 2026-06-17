export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";
export type GroupRole = "ADMIN" | "MEMBER";

export interface Group{
    id: string;
    name: string;
    created_by:string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface GroupInvite{
    groupId: string;
    status:InviteStatus,
    sendAt:string;
    senderId: string;
}

export interface CreateInvite{
    userId: string;
    email:string;
}
export interface GroupMember{
    userId:string;
    groupId:string;
    role:GroupRole;
    joinedAt: string;
}
export interface GroupStates{
    groups: Group[];
    createInvite: CreateInvite | null;
    groupInvite: GroupInvite[];
    groupMember: GroupMember[];
    loading: boolean;
    error: string | null;
    success: boolean;
}