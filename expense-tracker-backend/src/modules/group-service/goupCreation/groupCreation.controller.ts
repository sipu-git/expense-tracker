import { Request, Response } from "express";
import { createGroupSchema } from "../group.validation";
import { createGroup, exitOfGroup, modifyGroup, viewGroupById, viewGroups, viewOwnGroup } from "./groupCreation.service";
import { errorResponse, successResponse } from "../../../shared/util/ApiResponses";

export const buildGroup = async (req: Request, res: Response) => {
    const creatorId = req.user?.id;
    if (!creatorId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const parserInfos = await createGroupSchema.safeParse(req.body)
    if (!parserInfos.success) {
        return res.status(400).json({
            success: false, message: "Validation failed", errors: parserInfos.error.format()
        });
    }
    const infos = parserInfos.data
    const response = await createGroup({
        name: infos?.name,
        description: infos?.description
    }, creatorId)
    return res.status(201).json(successResponse("Geoup created successfully!", response))
}

export const fetchAllGroups = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const fetchGroups = await viewGroups(userId)
    return res.status(200).json(successResponse("Groups fetched successfully!", fetchGroups))
}
export const viewGroup = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const groupId = req.params.groupId.toString()
    const response = await viewGroupById(groupId, userId)
    return res.status(200).json(successResponse("Group fetched successfully!", response))
}

export const fetchOwnGroup = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const fetchGroups = await viewOwnGroup(userId)
    return res.status(200).json(successResponse("Groups fetched successfully!", fetchGroups))
    return res.status(500).json(errorResponse("Internal server error!"))
}

export const updateGroup = async (req: Request, res: Response) => {
    const { name, description } = req.body
    const groupId = req.params.groupId.toString()
    const response = await modifyGroup(groupId, { name, description })
    return res.status(200).json(successResponse("Group updated successfully!", response))
}

export const exitGroup = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const groupId = req.params.groupId.toString()
    await exitOfGroup(groupId, userId)
    return res.status(200).json(successResponse("Group exited successfully!"))
}

