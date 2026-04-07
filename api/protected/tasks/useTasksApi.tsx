import { api } from '@/api/api';
import { queryClient } from '@/components/common/queryClient/queryClient';
import { nullIfTrackingIdElseKeep } from '@/components/common/utils';
import { TaskItemModel, TaskItemSchema } from '@/components/protected/tasks/item/model';
import { TaskModel, TaskSchema } from '@/components/protected/tasks/model';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { isArray } from 'util';


export const useTasksApi = (ownerId: string) => {

  const invalidateQueries = () => queryClient.invalidateQueries({ 
    queryKey: ['tasks', ownerId],
    refetchType: 'none'
  });

  // Fetches list of tasks but ignores items that that do not pass validation
  const get = (ownerId: string, onSuccess: (data: TaskModel[]) => void) => useQuery<TaskModel[]>({
    queryKey: ['tasks', ownerId],
    queryFn: async (): Promise<TaskModel[]> => {
      const res = await api.get(`/tasks?ownerId=${ownerId}`, {});
      const json = res.data;
      if(!Array.isArray(json)) throw new Error('Response is not array');
      let validTasks = json
        .map(task => TaskSchema.safeParse(task).data)
        .filter(task => task != undefined)
      onSuccess(validTasks)
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
    onSuccess: () => invalidateQueries()
  });

  const update = useMutation({
    mutationFn: async (body: TaskModel) => {
      const sanitizedBody = {
        ...body,
        id: nullIfTrackingIdElseKeep(body.id),
        items: body.items.map(item => ({...item, id: nullIfTrackingIdElseKeep(item.id)}))
      }
      const res = await api.put(`/tasks?ownerId=${ownerId}`, sanitizedBody);
      return res.data
    },
    //onSuccess: () => invalidateQueries()
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
        const res = await api.delete(`/tasks/${taskId}`);
        return res.data
    },
    onSuccess: () => invalidateQueries()
  });


  return {
    get,
    update,
    create,
    deleteTask
  };
};