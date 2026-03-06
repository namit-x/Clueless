import { z } from "zod";

export const memberSchema = z.object({
    name: z.string().min(2),
    mobile: z.string().min(10),
    email: z.string().email(),
    branch: z.string(),
    isLeader: z.boolean(),
});

export const teamSignupSchema = z.object({
    teamName: z.string().min(3),
    password: z.string().min(6),
    teamSize: z.number().min(1).max(10),
    members: z.array(memberSchema),
});