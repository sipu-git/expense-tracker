import { prisma } from "../../../../lib/prisma.js";
import { GroupRole } from "../../../shared/configs/rbac.role.js";
import { createGroupInviteInput } from "../group.validation.js";

export async function sendInvites(groupId: string, senderId: string, infos: createGroupInviteInput) {
    const { userId, email } = infos;

    return await prisma.$transaction(async (tx:any) => {
        const membership = await tx.groupMembers.findUnique({
            where: {
                userId_groupId: {
                    userId: senderId,
                    groupId
                }
            }
        })
        if (!membership || membership.role !== GroupRole.ADMIN) {
            throw new Error("Only admin can send invites");
        }
        if (userId) {
            const user = await tx.user.findUnique({
                where: { id: userId, },
                select: { id: true }
            })
            if (!user) {
                throw new Error("User not found");
            }
            const existingMember = await tx.groupMembers.findUnique({
                where: {
                    userId_groupId: {
                        userId,
                        groupId,
                    },
                },
            });
            if (existingMember) {
                throw new Error("Member already exist!")
            }
            const existingInvite = await tx.groupInvite.findFirst({
                where: {
                    groupId,
                    userId,
                    status: "PENDING",
                },
            });

            if (existingInvite) {
                throw new Error("User already invited");
            }
        }

        if (email) {
            const existingInvite = await tx.groupInvite.findFirst({
                where: {
                    groupId,
                    email,
                    status: "PENDING",
                },
            });

            if (existingInvite) {
                throw new Error("Email already invited");
            }
        }

        const invite = await tx.groupInvite.create({
            data: {
                groupId,
                senderId,
                userId: userId ?? null,
                email: email ?? null,
                token: crypto.randomUUID().toString()
            }
        })
        return {
            invite
        }
    })
}

export async function viewAllInvitations(userId: string) {

    const findUser = await prisma.user.findUnique({
        where: { id: userId },
    })
    if (!findUser) {
        throw new Error("User not found");
    }
    const response = await prisma.groupInvite.findMany({
        select: {
            status: true,
            receiver: {
                select: {
                    full_name: true,
                    email: true,
                }
            },
            group: {
                select: {
                    name: true,
                }
            }
        }
    })
    return response;
}

export async function viewInvitationById(invite_id: string) {
    const response = await prisma.groupInvite.findUnique({
        where: { id: invite_id },
        select: {
            status: true,
            receiver: {
                select: {
                    full_name: true,
                    email: true,
                }
            },
            group: {
                select: {
                    name: true,
                }
            }
        }
    })
    return response;
}

export async function acceptInvitation(token: string, userId: string) {
    return await prisma.$transaction(async (tx:any) => {
        const invite = await tx.groupInvite.findUnique({
            where: { token: token }
        })
        if (!invite) {
            throw new Error("Invite not found");
        }
        if (invite.status !== "PENDING") {
            throw new Error("Invite not pending");
        }
        const updateInvite = await tx.groupInvite.update({
            where: { token: token },
            data: {
                status: "ACCEPTED",
                userId: userId
            }
        })
        await tx.groupMembers.create({
            data: {
                userId: userId,
                groupId: invite.groupId,
                role: GroupRole.MEMBER
            }
        })
        return updateInvite
    })
}

export async function rejectInvitation(id: string) {
    const response = await prisma.groupInvite.update({
        where: { id: id },
        data: {
            status: "DECLINED"
        }
    })
    return response;
}

export async function searchMember(query: string) {
    if (!query || query.trim().length < 2) {
        return []
    }
    return await prisma.user.findMany({
        where: {
            OR: [
                {
                    full_name: {
                        contains: query,
                        mode: "insensitive"
                    }
                },
                {
                    email: {
                        contains: query,
                        mode: "insensitive"
                    }
                }
            ]
        },
        select: {
            id: true,
            email: true,
            full_name: true
        },
        take: 10
    })
}