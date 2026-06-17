import express from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { accessRole } from '../../shared/middlewares/rbac.middileware.js';
import { GroupRole } from '../../shared/configs/rbac.role.js';
import { validate } from '../../shared/middlewares/validate.middileware.js';
import { createGroupSchema } from './group.validation.js';
import { buildGroup, fetchAllGroups, fetchOwnGroup, updateGroup, viewGroup } from './goupCreation/groupCreation.controller.js';
import { declineInvitation, fetchAllInvitations, findMembers, forwardInvitation, receiveInvitation, viewInvitation } from './groupInvitation/groupInvitation.controller.js';
import { asyncHandler } from '../../shared/middlewares/asyncHandler.middleware.js';

const router = express.Router()

router.post("/create-group", authMiddleware, validate({ body: createGroupSchema }), asyncHandler(buildGroup))
router.get("/view-groups", authMiddleware, fetchAllGroups)
router.get("/view-groupById/:groupId", authMiddleware, viewGroup)
router.patch("/update-group/:groupId", authMiddleware, accessRole([GroupRole.ADMIN]), asyncHandler(updateGroup))

// group invitation
router.post('/send-invitation/:groupId', authMiddleware, accessRole([GroupRole.ADMIN]), asyncHandler(forwardInvitation))
router.post('/accept-invitation/:token', authMiddleware, asyncHandler(receiveInvitation))
router.post('/decline-invitation/:groupId', authMiddleware, accessRole([GroupRole.MEMBER]), asyncHandler(declineInvitation))
router.get('/view-group-invitations', authMiddleware, asyncHandler(fetchAllInvitations))
router.get('/view-group-invitations/:groupId', authMiddleware, accessRole([GroupRole.ADMIN, GroupRole.MEMBER]), asyncHandler(viewInvitation))

router.get("/search-members", authMiddleware, asyncHandler(findMembers))
export default router;
