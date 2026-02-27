import { TaskItemModel } from "./item/model";
import { TaskModel } from "./model"

export const normalizeTaskSortOrder = (tasks: TaskModel[]): TaskModel[] => {
  return tasks.map((task, index) => ({
    ...task,
    sortOrder: index + 1,
    items: normalizeTaskItemsSortOrder(task.items)
  }));
};

export const normalizeTaskItemsSortOrder = (taskItems: TaskItemModel[]): TaskItemModel[] => {
    return taskItems.map((item, index) => ({
        ...item,
        sortOrder: index + 1
    }))
} 