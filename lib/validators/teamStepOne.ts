import { z } from "zod";

export const teamStepOneSchema = z.object({
    teamName: z.string().min(3, "Team name must be at least 3 characters"),
    teamSize: z.number().min(1).max(10),
});

export type TeamStepOneInput = z.infer<typeof teamStepOneSchema>;