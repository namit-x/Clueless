import { z } from "zod";

export const gameSchema = z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().optional(),
    max_points: z.number().int().positive(),
    is_active: z.boolean().default(true)
});