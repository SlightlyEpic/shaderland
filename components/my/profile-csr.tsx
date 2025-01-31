'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import LoginButton from './login-button';
import { Card, CardContent } from '../ui/card';
import { twMerge } from 'tailwind-merge';

type ProfileCsrProps = {
    className?: string,
};

export default function ProfileCsr({ className }: ProfileCsrProps) {
    const { user, error, isLoading } = useUser();

    if(user) {
        return (
            <Card className={twMerge('rounded-md', className)}>
                <CardContent className='flex gap-2 items-center p-2 py-1'>
                        <div>
                            {user.nickname}
                        </div>
                        <Avatar>
                            <AvatarImage src={user.picture!} className='rounded-full w-8 aspect-square' />
                            <AvatarFallback className='rounded-full w-8 aspect-square flex items-center justify-center bg-slate-800'>
                                {(user.nickname ?? '?')[0]}
                            </AvatarFallback>
                        </Avatar>
                </CardContent>
            </Card>
        )
    }

    return <LoginButton />
}
