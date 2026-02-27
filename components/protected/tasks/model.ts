// models/task.ts
import { TaskItemModel, TaskItemSchema } from "./item/model";
import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1, "Title cannot be empty").max(255, "Content cannot exceed 255 characters"),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  ownerId: z.string(),
  sortOrder: z.number().min(1),
  items: z.array(TaskItemSchema).default([]),
});

export type TaskModel = z.infer<typeof TaskSchema>;