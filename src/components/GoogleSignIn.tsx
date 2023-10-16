import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';

import * as config from '@/config';

interface GoogleComponentProps {
    sizeRef: any;
    redirectUrl?: string;
}

const GoogleSignIn = ({ sizeRef: walletRef, redirectUrl }: GoogleComponentProps) => {
    const [googleDivWith, setGoogleDivWith] = useState('200px');

    useEffect(() => {
        function handleResize() {
            const width = walletRef?.current ? walletRef?.current.offsetWidth : '200px'

            if (width >= 400)
                setGoogleDivWith('400px');
            else
                setGoogleDivWith(width + "px");
        }

        if (walletRef?.current.offsetWidth) handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [walletRef]);

    const redirect = (path: string) => {
        window.location.href = `${window.location.origin}/${path}`;
    }

    const googleLogin = async (response: any) => {
        const resp = await fetch(`${config.apiBase}auth/google/`, {
            headers: config.postAPIHeaders,
            method: 'post',
            body: JSON.stringify(response),
        });

        if (resp.ok) {
            redirect(redirectUrl || "/dashboard");
        } else {
            alert('incorrect username or password');
        }
    };

    return (
        <div>
            <GoogleOAuthProvider clientId={config?.googleClientId}>
                <GoogleLogin
                    width={`${googleDivWith}`}
                    // width={`300px`}
                    logo_alignment='center'
                    shape='circle'
                    size='large'
                    useOneTap={true}
                    onSuccess={(creds: any) => googleLogin(creds)}
                    onError={() => {
                        // FIXME: error handling
                        // eslint-disable-next-line no-console
                        console.log('Login Failed');
                    }}
                />
            </GoogleOAuthProvider>
        </div>
    );
};

export default GoogleSignIn;