import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../lib/prisma";
import { GroupRole } from "../configs/rbac.role";

declare global {
  namespace Express {
    interface Request {
      membership?: any;
    }
  }
}

export const accessRole = (allowedRoles: GroupRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const groupId = req.params.groupId as string;

      if (!groupId) {
        return res.status(400).json({ message: "Group ID required" });
      }

      const membership = await prisma.groupMembers.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ message: "Not part of this group" });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.membership = membership; 
      next();
    } catch (err) {
      next(err);
    }
  };
};