import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { OAuthState } from '../types';
import React from 'react';

interface GoogleLoginButtonProps {
    onSuccess: (idToken: string) => void;
}

export const GoogleLoginButton = React.memo( ({ onSuccess }: GoogleLoginButtonProps) => {
    console.log("Rendering GoogleLoginButton");
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <GoogleLogin
                size="large"
                width={10000}
                onSuccess={(response) => {
                    if (response.credential) {
                        onSuccess(response.credential)
                    } else {
                        console.error('Google login succeeded but no credential found');
                    }
                }}
                onError={() => console.error('Google login failed')}
                />
        </GoogleOAuthProvider>
    );
});