import z from "zod";

export const createBodySchema = z.object({
    name: z.string().min(3),
    fullName: z.string().min(3),
    plan: z.enum(["free", "pro"]),
    repoUrl: z.string().min(1, "Select a repository"),
    cloneUrl: z.string().min(1),
    isPrivate: z.boolean(),
    language: z.string().min(1)
})

export type CreateBody = z.infer<typeof createBodySchema>