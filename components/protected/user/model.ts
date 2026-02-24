import { z } from "zod";


export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: z.string(),
});

export type UserModel = z.infer<typeof UserSchema>