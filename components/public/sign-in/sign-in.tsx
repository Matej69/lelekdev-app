'use client';

import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { OAuthState } from './types';
import { GoogleLoginButton } from './google-login-button';

export default function SignIn() {
    const [oAuthState, setOAuthState] = useState<OAuthState | null>(null);

    return (
        <div className="w-full max-w-md p-8 bg-white border-2 border-black shadow-[8px_8px_0_black]">
            <h1 className="text-2xl font-bold text-center text-black">Sign In</h1>
            <p className='text-gray-700 py-4'>At present, the only available sign in method is via Google OAuth and only for verified users.</p>
            { /* OAuth login options */}
            <div className="w-full flex items-center justify-center">
                <GoogleLoginButton setOAuthState={setOAuthState} />
            </div>
        </div>
    );
}