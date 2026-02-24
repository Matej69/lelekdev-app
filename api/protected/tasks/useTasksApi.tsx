import { queryClient } from '@/components/common/queryClient/queryClient';
import { nullIfTrackingIdElseKeep } from '@/components/common/utils';
import { TaskModel } from '@/components/protected/tasks/model';
import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';


export const useTasksApi = (ownerId: string) => {

  const get = useQuery<TaskModel[]>({
    queryKey: ['tasks', ownerId],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8080/tasks?ownerId=${ownerId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
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