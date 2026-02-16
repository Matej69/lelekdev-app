'use client';

import { Icon, ListTodo, UtensilsCrossed } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

const navigationItemsData = [
    {
        name: 'Tasks',
        icon: ListTodo ,
        redirectTo: '/tasks'
    },
    {
        name: 'Recipes',
        icon: UtensilsCrossed,
        redirectTo: '/recipes'
    }
]

const getIconColor = (path: string, currentPath: string) => {
    return path === currentPath ? 'stroke-gray-900' : 'stroke-gray-400';
}

const getTextColor = (path: string, currentPath: string) => {
    return path === currentPath ? 'text-gray-900' : 'text-gray-400';
}


export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex flex-col items-start w-60 h-full max-h-screen p-4 gap-4 bg-white overflow-y-auto border shadow-[8px_8px_0_black]">
            { /* Navigation items */}
            {
                navigationItemsData.map(({name, icon: Icon, redirectTo}) => (
                    <div className="flex items-center w-full gap-2 pl-7 group cursor-pointer" key={name} onClick={() => router.push(redirectTo)}>
                        <Icon className={getIconColor(redirectTo, pathname) + ' transition-colors'} />
                        <p className={getTextColor(redirectTo, pathname) + ' text-lg font-bold transition-colors'}>{name}</p>    
                    </div>
                ))
            }
        </div>
    );
}