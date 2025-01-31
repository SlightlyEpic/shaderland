'use client';

import ProfileCsr from '@/components/my/profileCsr';
import { useUser } from '@auth0/nextjs-auth0/client';
import { redirect } from 'next/navigation';

export default function AuthOnlyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, error, isLoading } = useUser();

    if(isLoading) return <></>;
    if(!user) redirect('/');

    return children;
}
