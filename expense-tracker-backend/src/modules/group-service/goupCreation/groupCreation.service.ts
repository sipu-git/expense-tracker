import { prisma } from "../../../../lib/prisma.js";
import { GroupRole } from "../../../shared/configs/rbac.role.js";
import { createGroupInput } from "../group.validation.js";

export async function createGroup(data: createGroupInput, creatorId: string) {
    const { name, description } = data

    return await prisma.$transaction(async (orm:any) => {

        const creator = await orm.user.findUnique({
            where: { id: creatorId },
            select: {
                email: true,
                full_name: true,
                id: true
            }
        })
        if (!creator) throw new Error("Authenticated user not found");


        return await orm.group.create({
            data: {
                name,
                description,
                created_by: creatorId,
                members: {
                    create: {
                        userId: creatorId, role: GroupRole.ADMIN
                    }
                }
            },
            select: {
                id: true,
                name: true,
                description: true,
                created_by: true,
                createdAt: true,
                creator: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true
                    }
                },
                members: {
                    select: {
                        id: true,
                        role: true,
                        joinedAt: true,
                        user: {
                            select: {
                                full_name: true,
                                email: true,
                            }
                        },

                    }
                }
            }
        })
    })
}


export async function viewGroups(userId: string) {
    return await prisma.$transaction(async (tx:any) => {
        const responses = await tx.group.findMany({
            where: {
                OR: [
                    {
                        created_by: userId
                    },
                    {
                        members: {
                            some: {
                                userId: userId
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                created_by: true,
                createdAt: true,
                updatedAt: true,
                members: true,
            },
        })
        return responses;
    })
}


export async function viewGroupById(groupId: string, userId: string) {
    return await prisma.$transaction(async (orm:any) => {
        const membership = await orm.groupMembers.findUnique({
            where: {
                userId_groupId: { userId, groupId }
            }
        })
        if (!membership) throw new Error("Access Denied")

        return await orm.group.findUnique({
            where: { id: groupId },
            select: {
                name: true,
                description: true,
                members: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                full_name: true,
                                email: true,
                                id: true
                            }
                        }
                    }
                }
            }
        })
    })
}


export async function viewOwnGroup(userId: string) {
    return await prisma.groupMembers.findMany({
        where: {
            userId,
        },
        select: {
            group: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    createdAt: true,
                },
            },
            role: true,
        },
    });
}


export async function modifyGroup(groupId: string, data: Partial<createGroupInput>) {
    const updatedData: Partial<createGroupInput> = {};

    if (data.name !== undefined) updatedData.name = data.name;
    if (data.description !== undefined) updatedData.description = data.description;

    return await prisma.group.update({
        where: {
            id: groupId,
        },
        data: updatedData
    });
}


export async function exitOfGroup(groupId: string, userId: string) {
    return await prisma.groupMembers.delete({
        where: {
            userId_groupId: {
                userId,
                groupId,
            },
        },
    });
}
