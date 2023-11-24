import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  user: z.any(),
  email: z.any(),
  community: z.any(),
  etat: z.any(),
})

export type Request = z.infer<typeof taskSchema>