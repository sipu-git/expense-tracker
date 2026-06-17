import z from "zod";
import { GroupRole } from "../../shared/configs/rbac.role.js";

export const createGroupSchema = z.object({
    name: z.string().min(3, "Group name must be at least 3 characters")
        .max(50, "Group name cannot exceed 50 characters"),
    description: z.string().min(3, "Group name must be at least 3 characters")
        .max(150, "Group name cannot exceed 150 characters"),

})

export const createMemberSchema = z.object({
    userId: z.string().uuid("Invalid User id"),
    // groupId: z.string().uuid("Invalid group id"),
    role: z.nativeEnum(GroupRole).optional()
})

export const createGroupInviteSchema = z
  .object({
    userId: z.string().uuid("Invalid user ID").optional(),
    email: z.string().email("Invalid email").optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email must be provided",
    path: ["userId"], // attach error nicely
  })
  .refine((data) => !(data.userId && data.email), {
    message: "Provide only one of userId or email, not both",
    path: ["userId"],
  });

export type createGroupInput = z.infer<typeof createGroupSchema>
export type createMemberInput = z.infer<typeof createMemberSchema>
export type createGroupInviteInput = z.infer<typeof createGroupInviteSchema>