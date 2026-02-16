import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();

    const signIn = useMutation({
        mutationFn: async (idToken: string) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ externalIdToken: idToken }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Sign in failed');
        },
        onSuccess: () => {
            router.push('/products');
        },
    });

    const signOut = useMutation({
        mutationFn: () =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-out`, {
                method: 'POST',
                credentials: 'include',
            }),
        onSuccess: () => {
            router.push('/sign-in');
        },
    });

    return {
        signIn: signIn.mutate,
        signInLoading: signIn.isPending,
        signOut: signOut.mutate,
        signOutLoading: signOut.isPending,
    };
};