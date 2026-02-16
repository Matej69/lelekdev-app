'use client';

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


export default function SignOutButton() {

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: () => fetch('http://localhost:8080/auth/sign-out', { 
            method: 'POST',
            credentials: 'include'
        })
    });

    const onSignOut = () => {
        mutation.mutate(undefined, { onSuccess: () => router.push('/sign-in') });
    }

    return (
        <div className="flex items-center justify-center h-full aspect-square bg-white border border-black hover:cursor-pointer" onClick={onSignOut}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
        </div>
    );
}