import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { OAuthState } from './types';
import React from 'react';

interface GoogleLoginButtonProps {
    setOAuthState: (state: OAuthState) => void;
}

export const GoogleLoginButton = React.memo( ({ setOAuthState }: GoogleLoginButtonProps) => {
    console.log("Rendering GoogleLoginButton");
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
            <GoogleLogin
                size="large"
                width={10000}
                onSuccess={(response) => {
                    if (response.credential) {
                        setOAuthState({ credential: response.credential, error: null });
                    } else {
                        setOAuthState({ credential: null, error: 'No credential received from Google' });
                    }
                }}
                onError={() => setOAuthState({ credential: null, error: 'Error signing in with Google' })}
                />
        </GoogleOAuthProvider>
    );
});