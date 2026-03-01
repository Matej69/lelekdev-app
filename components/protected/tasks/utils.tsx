import { TaskItemModel } from "./item/model";
import { TaskModel } from "./model"

// Normalization works for tasks that are already sorted by sortOrder
// If not then wrong indices will be asigned to sort order
export const normalizeTaskSortOrder = (tasks: TaskModel[]): TaskModel[] => {
  return tasks.map((task, index) => ({
    ...task,
    sortOrder: index + 1,
    items: normalizeTaskItemsSortOrder(task.items)
  }));
};

// Normalization works for task items that are already sorted by sortOrder
// If not then wrong indices will be asigned to sort order
export const normalizeTaskItemsSortOrder = (taskItems: TaskItemModel[]): TaskItemModel[] => {
    return taskItems.map((item, index) => ({
        ...item,
        sortOrder: index + 1
    }))
} 