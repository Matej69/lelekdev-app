// models/task.ts
import { TaskItemModel, TaskItemSchema } from "./item/model";
import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  items: z.array(TaskItemSchema).default([]),
});

export type TaskModel = z.infer<typeof TaskSchema>;