'use client';

import { useAuth } from '@/api/public/auth/useAuth';
import { GoogleLoginButton } from './google/google-login-button';

export default function SignIn() {
    const { signIn } = useAuth()
    const onOAuthSuccess = (idToken: string) => signIn(idToken);

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