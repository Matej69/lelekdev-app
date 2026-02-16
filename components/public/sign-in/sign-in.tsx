'use client';

import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { OAuthState } from './types';
import { GoogleLoginButton } from './google/google-login-button';
import { useMutation, useQuery } from '@tanstack/react-query';
import { redirect } from 'next/dist/server/api-utils';
import { on } from 'events';
import { useRouter } from 'next/navigation';

export default function SignIn() {

    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (idToken: string) => {
            const res = await fetch('http://localhost:8080/auth/sign-in', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ externalIdToken: idToken }),
              credentials: 'include'
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => {
            router.push('/products')
        }
    });

    const onOAuthSuccess = (idToken: string) => mutation.mutate(idToken);

    return (
        <div className="w-full max-w-md p-8 bg-white border-2 border-black shadow-[8px_8px_0_black]">
            <h1 className="text-2xl font-bold text-center text-black">Sign In</h1>
            <p className='text-gray-700 py-4'>At present, the only available sign in method is via Google OAuth and only for verified users.</p>
            { /* OAuth login options */}
            <div className="w-full flex items-center justify-center">
                <GoogleLoginButton onSuccess={onOAuthSuccess} />
            </div>
        </div>
    );
}