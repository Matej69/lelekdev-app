'use client'

import { queryClient } from '@/components/common/queryClient/queryClient';
import { useTasks } from '@/components/protected/tasks/useTasks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { DragDropProvider } from './DragDropProvider';

export default function Providers({ children }: { children: ReactNode })  {

    return (
        <QueryClientProvider client={queryClient}>
            <DragDropProvider>
                {children}
            </DragDropProvider>
        </QueryClientProvider>
    );
};
