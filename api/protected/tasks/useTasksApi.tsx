import { api } from '@/api/api';
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
      const res = await api.get(`/tasks?ownerId=${ownerId}`, {});
      const json = res.data;
      if(!Array.isArray(json)) throw new Error('Response is not array');
      let validTasks = json
        .map(task => TaskSchema.safeParse(task).data)
        .filter(task => task != undefined)
      return validTasks
    }
  });

  const create = useMutation({
    mutationFn: async (body: TaskModel) => {
      const sanitizedBody = { 
        ...body,
        id: nullIfTrackingIdElseKeep(body.id),
        items: body.items.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)})) 
      }
        const res = await api.post(`/tasks`, sanitizedBody);
        return res.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', ownerId] }) }
  });

  const update = useMutation({
    mutationFn: async (body: TaskModel) => {
      const sanitizedBody = { 
        ...body, 
        items: body.items.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)})) 
      }
      const res = await api.put(`/tasks?ownerId=${ownerId}`, sanitizedBody);
      return res.data
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', ownerId] }) }
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
        const res = await api.delete(`/tasks/${taskId}`);
        return res.data
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