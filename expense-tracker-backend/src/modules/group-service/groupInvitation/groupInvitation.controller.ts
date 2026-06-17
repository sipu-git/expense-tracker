import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../../shared/util/ApiResponses.js";
import { createGroupInviteSchema } from "../group.validation.js";
import { acceptInvitation, rejectInvitation, searchMember, sendInvites, viewAllInvitations, viewInvitationById } from "./groupInvitation.service.js";

export const forwardInvitation = async (req: Request, res: Response) => {
    const groupId = req.params.groupId.toString()
    const senderId = req.user?.id
    if (!senderId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const parseInfos = await createGroupInviteSchema.safeParse(req.body)
    if (!parseInfos.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: parseInfos.error.format()
        });
    }
    const infos = await sendInvites(groupId, senderId, parseInfos.data)
    return res.status(201).json(successResponse("Invitation sent successfully!", infos))
}

export const fetchAllInvitations = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    const response = await viewAllInvitations(userId)
    return res.status(200).json(successResponse("Invitations fetched successfully!", response))
}

export const viewInvitation = async (req: Request, res: Response) => {
    const invite_id = req.params as any;
    if (!invite_id) {
        return res.status(400).json(errorResponse("invitation id is required!"))
    }
    const results = await viewInvitationById(invite_id)
    return res.status(200).json(successResponse("Invitations fetched successfully!", results))
}

export const receiveInvitation = async (req: Request, res: Response) => {
    const  token = req.params.token as string;
    console.log("Invite ID:", token);
    const userId = req.user?.id
    if (!userId) {
        return res.status(401).json(errorResponse("Unauthorized!"))
    }
    if (!token) {
        return res.status(400).json(errorResponse("token is required!"))
    }
    const response = await acceptInvitation(token, userId)
    return res.status(200).json(successResponse("Invitations accepted successfully!", response))
}

export const declineInvitation = async (req: Request, res: Response) => {
    const invite_id = req.params as any;
    if (!invite_id) {
        return res.status(400).json(errorResponse("invitation id is required!"))
    }
    await rejectInvitation(invite_id)
    return res.status(200).json(successResponse("Invitations declined successfully!"))
}

export const findMembers = async (req: Request, res: Response) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json(errorResponse("search query is required!"))
    }
    const results = await searchMember(query as string)
    return res.status(200).json(successResponse("Members fetched successfully!", results))
}