import { queryClient } from '@/components/common/queryClient/queryClient';
import { nullIfTrackingIdElseKeep } from '@/components/common/utils';
import { TaskItemModel, TaskItemSchema } from '@/components/protected/tasks/item/model';
import { TaskModel, TaskSchema } from '@/components/protected/tasks/model';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { isArray } from 'util';


export const useTasksApi = (ownerId: string) => {

  // Fetches list of tasks but ignores items that that do not pass validation
  const get = useQuery<TaskModel[]>({
    queryKey: ['tasks', ownerId],
    queryFn: async (): Promise<TaskModel[]> => {
      const res = await fetch(`http://localhost:8080/tasks?ownerId=${ownerId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const json = await res.json()
      if(!Array.isArray(json)) throw new Error('Response is not array');
      // Keep only valid tasks(task is valid if all its data and all of its items data is valid)
      let tasks = json
        .map(task => TaskSchema.safeParse(task).data)
        .filter(task => task != undefined)
      // Normalize sort order - whatever order number tasks and task items have, we normalize them by assigning their index+1 to their sortOrder
      // No sorting is needed since they are always fetched in order
      // tasks = normalizeTaskSortOrder(tasks)
      return tasks
    }
  });

  const create = useMutation({
    mutationFn: async (body: TaskModel) => {
      const sanitizedBody = { 
        ...body,
        id: nullIfTrackingIdElseKeep(body.id),
        items: body.items.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)})) 
      }
        const res = await fetch(`http://localhost:8080/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedBody),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to create tasks');
        return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', ownerId] }) }
  });

  const update = useMutation({
    mutationFn: async (body: TaskModel) => {
      const sanitizedBody = { 
        ...body, 
        items: body.items.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)})) 
      }
      const res = await fetch(`http://localhost:8080/tasks?ownerId=${ownerId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedBody),
          credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update tasks');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', ownerId] }) }
  });


  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
        const res = await fetch(`http://localhost:8080/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to delete tasks');
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', ownerId] }) }
  });


  return {
    get,
    update,
    create,
    deleteTask
  };
};