
import { z } from "zod";

export const TaskItemSchema = z.object({
  id: z.string(),
  content: z.string().trim().min(1, "Task item content cannot be empty").max(2000, "Content cannot exceed 2000 characters"),
  completed: z.boolean().default(false),
  sortOrder: z.number().min(1),
});

export type TaskItemModel = z.infer<typeof TaskItemSchema>;
